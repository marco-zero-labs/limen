import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { DataState } from '@/components/DataState';
import { useFeedback } from '@/components/Feedback';
import { Field } from '@/components/Field';
import { NoAccess } from '@/components/NoAccess';
import { Page } from '@/components/Page';
import { SetupActions, SetupPage } from '@/components/SetupPage';
import { useQuery, useRepo, useViewer } from '@/data/DataProvider';
import { Church } from '@/data/types';
import { canEditArea } from '@/domain/permissions';
import { formatCep, formatPhone, isValidPhone, onlyDigits } from '@/lib/format';

/** Etapa 1: dados da igreja. O CEP preenche rua, bairro e cidade quando há internet. */
export default function DadosDaIgreja() {
  const viewer = useViewer();
  const q = useQuery((r) => r.getChurch());
  if (!canEditArea(viewer, 'pessoas')) return <NoAccess what="a configuração inicial" />;
  if (!q.data) {
    return (
      <Page bare title="Configuração inicial">
        <DataState error={q.error} reload={q.reload} />
      </Page>
    );
  }
  return <Form church={q.data} />;
}

type ViaCep = { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean };

function Form({ church }: { church: Church }) {
  const viewer = useViewer();
  const repo = useRepo();
  const { toast } = useFeedback();
  const [f, setF] = useState({ ...church });
  const [cepResult, setCepResult] = useState<{ cep: string; state: 'ok' | 'fail' | 'notfound' } | null>(null);
  const [tried, setTried] = useState(false);
  const set = (k: keyof Church) => (v: string) => setF((x) => ({ ...x, [k]: v }));

  // busca o endereço pelo CEP (ViaCEP); sem internet, o preenchimento é manual.
  // "Buscando" é o intervalo entre um CEP novo completo e a resposta para esse mesmo CEP.
  const cep = onlyDigits(f.cep);
  const lookup = cep.length === 8 && cep !== onlyDigits(church.cep);
  const cepState = !lookup ? 'idle' : cepResult?.cep === cep ? cepResult.state : 'loading';
  useEffect(() => {
    if (!lookup) return;
    let alive = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: ctrl.signal })
      .then((r) => r.json() as Promise<ViaCep>)
      .then((j) => {
        if (!alive) return;
        if (j.erro) return setCepResult({ cep, state: 'notfound' });
        setF((x) => ({ ...x, street: j.logradouro || x.street, district: j.bairro || x.district, city: j.localidade ? `${j.localidade} – ${j.uf}` : x.city }));
        setCepResult({ cep, state: 'ok' });
      })
      .catch(() => alive && setCepResult({ cep, state: 'fail' }))
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [cep, lookup]);

  const errors = {
    name: !f.name.trim() ? 'Informe o nome da igreja.' : null,
    phone: f.phone && !isValidPhone(f.phone) ? 'Telefone incompleto. Ex.: (81) 3427-0040' : null,
  };
  const next = async () => {
    setTried(true);
    if (errors.name || errors.phone) return;
    await repo.updateChurch({ ...f, setupStep: Math.max(church.setupStep, 2) }, viewer.userId);
    router.push('/configuracao-inicial/cultos');
    toast('Dados da igreja salvos');
  };
  const cepHelp = { idle: 'Rua, bairro e cidade são preenchidos pelo CEP.', loading: 'Buscando o endereço…', ok: 'Endereço preenchido pelo CEP. Confira.', fail: 'Sem conexão para buscar o CEP. Preencha o endereço.', notfound: 'CEP não encontrado. Preencha o endereço.' }[cepState];

  return (
    <SetupPage
      step={1}
      title="Dados da igreja"
      subtitle="Aparecem na ficha de visitante, no termo de consentimento e nas mensagens."
      footer={
        <SetupActions>
          <Button kind="primary" main label="Continuar" onPress={next} />
        </SetupActions>
      }
    >
      <Field label="Nome da igreja" value={f.name} onChangeText={set('name')} error={tried ? errors.name : null} />
      <Field label="Convenção ou denominação" optional value={f.denomination} onChangeText={set('denomination')} />
      <Field label="CEP" value={f.cep} onChangeText={set('cep')} mask={formatCep} keyboardType="number-pad" tabular help={cepHelp} />
      <Field label="Endereço" value={f.street} onChangeText={set('street')} />
      <Field label="Número" value={f.number} onChangeText={set('number')} keyboardType="number-pad" />
      <Field label="Bairro" value={f.district} onChangeText={set('district')} />
      <Field label="Cidade" value={f.city} onChangeText={set('city')} />
      <Field label="Telefone da secretaria" value={f.phone} onChangeText={set('phone')} mask={formatPhone} keyboardType="phone-pad" tabular error={tried ? errors.phone : null} help="Usado no termo de consentimento para pedidos de exclusão." />
    </SetupPage>
  );
}
