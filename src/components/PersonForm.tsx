import { Href, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, TextLink } from './Button';
import { useFeedback } from './Feedback';
import { Checkbox, Choice, Field } from './Field';
import { FormActions, goBack, Page, Section } from './Page';
import { Txt } from './Txt';
import { useRepo, useViewer } from '@/data/DataProvider';
import { Person, PersonKind } from '@/data/types';
import { AppData } from '@/data/useAppData';
import { canEditPastoralNote } from '@/domain/permissions';
import { findByPhone } from '@/domain/visitors';
import { fmtBrDate, parseBrDate, toDateTime } from '@/lib/dates';
import { formatDateInput, formatPhone, isValidPhone } from '@/lib/format';
import { colors } from '@/theme/tokens';

const FIELD_NAMES: Record<string, string> = {
  name: 'nome',
  phone: 'telefone',
  email: 'e-mail',
  birthDate: 'nascimento',
  address: 'endereço',
  kind: 'tipo',
  memberSince: 'data de membro',
  ministries: 'ministérios',
  familyId: 'família',
  familyRole: 'família',
  pastoralNote: 'nota pastoral',
  active: 'situação',
};

/** Formulário de pessoa (nova e editar). */
export function PersonForm({ d, person }: { d: AppData; person?: Person }) {
  const viewer = useViewer();
  const repo = useRepo();
  const { toast } = useFeedback();
  const editing = !!person;
  const back: Href = editing ? `/pessoas/${person!.id}` : '/pessoas';
  const [name, setName] = useState(person?.name ?? '');
  const [phone, setPhone] = useState(person?.phone ?? '');
  const [email, setEmail] = useState(person?.email ?? '');
  const [birth, setBirth] = useState(person?.birthDate ? fmtBrDate(person.birthDate) : '');
  const [address, setAddress] = useState(person?.address ?? '');
  const [kind, setKind] = useState<PersonKind>(person?.kind === 'visitante' ? 'visitante' : person?.kind ?? 'membro');
  const [active, setActive] = useState(person?.active ?? true);
  const [since, setSince] = useState(person?.memberSince ? fmtBrDate(person.memberSince) : '');
  const [family, setFamily] = useState(person?.familyId ?? 'nenhuma');
  const [familyRole, setFamilyRole] = useState(person?.familyRole ?? '');
  const [ministries, setMinistries] = useState<string[]>(person?.ministries.map((m) => m.ministryId) ?? []);
  const [note, setNote] = useState(person?.pastoralNote ?? '');
  const [consent, setConsent] = useState<'pendente' | 'verbal'>('pendente');
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);

  const dup = isValidPhone(phone) ? findByPhone(d.people, phone, person?.id) : null;
  const birthDay = birth ? parseBrDate(birth) : null;
  const sinceDay = since ? parseBrDate(since) : null;
  const errors = {
    name: !name.trim() ? 'Escreva o nome.' : null,
    phone: phone && !isValidPhone(phone) ? 'Faltam dígitos. Ex.: (81) 99812-4407' : null,
    birth: birth && !birthDay ? 'Data inválida. Ex.: 12/03/1961' : null,
    since: since && !sinceDay ? 'Data inválida. Ex.: 14/06/1998' : null,
    email: email && !/^\S+@\S+\.\S+$/.test(email) ? 'E-mail inválido.' : null,
  };
  const hasError = Object.values(errors).some(Boolean);

  const save = async () => {
    setTried(true);
    if (hasError) return;
    setSaving(true);
    const data: Partial<Person> = {
      name: name.trim(),
      phone: phone || undefined,
      email: email.trim() || undefined,
      birthDate: birthDay ?? undefined,
      address: address.trim() || undefined,
      kind,
      active,
      memberSince: kind === 'membro' ? sinceDay ?? undefined : undefined,
      familyId: family === 'nenhuma' ? undefined : family,
      familyRole: family === 'nenhuma' ? undefined : familyRole.trim() || undefined,
    };
    try {
      if (editing) {
        const p = person!;
        const patch: Partial<Person> = { ...data };
        const prevIds = p.ministries.map((m) => m.ministryId);
        if (prevIds.join() !== ministries.join()) patch.ministries = ministries.map((id) => p.ministries.find((m) => m.ministryId === id) ?? { ministryId: id });
        if (canEditPastoralNote(viewer)) patch.pastoralNote = note.trim() || undefined;
        const changed = (Object.keys(patch) as (keyof Person)[]).filter((k) => JSON.stringify(patch[k] ?? null) !== JSON.stringify(p[k] ?? null));
        if (changed.length === 0) {
          goBack(back);
          return;
        }
        const names = [...new Set(changed.map((k) => FIELD_NAMES[k] ?? 'dados'))];
        const action = names.length === 1 ? `Alterou ${names[0]}` : 'Alterou dados';
        const undo = await repo.updatePerson(p.id, patch, viewer.userId, action);
        goBack(back);
        toast('Cadastro salvo', undo);
      } else {
        const { id, undo } = await repo.createPerson(
          {
            name: data.name!,
            phone: data.phone,
            email: data.email,
            birthDate: data.birthDate,
            address: data.address,
            kind,
            memberSince: data.memberSince,
            familyId: data.familyId,
            familyRole: data.familyRole,
            ministryIds: ministries,
            pastoralNote: canEditPastoralNote(viewer) ? note.trim() || undefined : undefined,
            consent: consent === 'verbal' ? { status: 'verbal', at: toDateTime(new Date()), via: `verbal, coletado por ${d.name(viewer.userId)}` } : { status: 'pendente', via: 'link pelo WhatsApp' },
          },
          viewer.userId,
        );
        router.replace(`/pessoas/${id}`);
        toast('Pessoa cadastrada', async () => {
          await undo();
          router.replace('/pessoas');
        });
      }
    } catch (e) {
      setSaving(false);
      toast(`Não foi possível salvar: ${(e as Error).message}`);
    }
  };

  const saveBtn = <Button kind="primary" main label={editing ? 'Salvar alterações' : 'Salvar pessoa'} loading={saving} onPress={save} />;

  return (
    <Page back={back} title={editing ? 'Editar cadastro' : 'Nova pessoa'} subtitle={editing ? person!.name : undefined} footer={saveBtn}>
      <Field label="Nome" value={name} onChangeText={setName} error={tried ? errors.name : null} autoCapitalize="words" />
      <Field
        label="Telefone"
        optional
        value={phone}
        onChangeText={setPhone}
        mask={formatPhone}
        keyboardType="phone-pad"
        tabular
        error={tried || phone.length > 13 ? errors.phone : null}
        below={
          dup ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 8 }}>
              <Txt v="small" w={500} color={colors.amberText}>
                Este telefone já está cadastrado para {dup.name}
              </Txt>
              <TextLink small label="· ver perfil" onPress={() => router.push(`/pessoas/${dup.id}`)} />
            </View>
          ) : null
        }
      />
      <Field label="E-mail" optional value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={tried ? errors.email : null} />
      <Field label="Nascimento" optional value={birth} onChangeText={setBirth} mask={formatDateInput} keyboardType="number-pad" placeholder="dd/mm/aaaa" tabular error={tried ? errors.birth : null} />
      <Field label="Endereço" optional value={address} onChangeText={setAddress} placeholder="Rua, número, bairro, cidade" />
      {kind !== 'visitante' ? (
        <Choice<PersonKind>
          label="Tipo"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'membro', label: 'Membro' },
            { value: 'congregado', label: 'Congregado' },
          ]}
        />
      ) : null}
      {kind === 'membro' ? <Field label="Membro desde" optional value={since} onChangeText={setSince} mask={formatDateInput} keyboardType="number-pad" placeholder="dd/mm/aaaa" tabular error={tried ? errors.since : null} /> : null}
      {editing ? <Checkbox label="Ativo" hint="Desmarque quando a pessoa deixar de frequentar." checked={active} onChange={setActive} /> : null}

      <Section title="Família">
        <Choice<string> label="Família" value={family} onChange={setFamily} options={[{ value: 'nenhuma', label: 'Nenhuma' }, ...d.families.map((f) => ({ value: f.id, label: f.name }))]} />
        {family !== 'nenhuma' ? <Field label="Papel na família" optional value={familyRole} onChangeText={setFamilyRole} placeholder="Ex.: Filha, Esposo" /> : null}
      </Section>

      <Section title="Ministérios">
        <View>
          {d.ministries.map((m) => (
            <Checkbox key={m.id} label={m.name} checked={ministries.includes(m.id)} onChange={(on) => setMinistries((list) => (on ? [...list, m.id] : list.filter((x) => x !== m.id)))} />
          ))}
        </View>
      </Section>

      {canEditPastoralNote(viewer) ? (
        <Section title="Nota pastoral">
          <Field label="Nota pastoral" optional value={note} onChangeText={setNote} multiline help="Visível só para pastor e secretaria. Cada abertura fica registrada." />
        </Section>
      ) : null}

      {!editing ? (
        <Section title="Consentimento LGPD">
          <Choice<'pendente' | 'verbal'>
            label="Como foi coletado"
            layout="list"
            value={consent}
            onChange={setConsent}
            options={[
              { value: 'pendente', label: 'Pendente (enviar link pelo WhatsApp)', hint: 'Depois de salvar, envie o pedido pela página da pessoa.' },
              { value: 'verbal', label: `Verbal, coletado por ${d.name(viewer.userId)}`, hint: 'Precisa de confirmação por escrito depois.' },
            ]}
          />
        </Section>
      ) : null}

      <FormActions>
        {saveBtn}
        <Button kind="text" label="Cancelar" onPress={() => goBack(back)} />
      </FormActions>
    </Page>
  );
}
