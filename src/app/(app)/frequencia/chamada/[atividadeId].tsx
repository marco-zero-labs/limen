import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, TextLink } from '@/components/Button';
import { DataState } from '@/components/DataState';
import { useFeedback } from '@/components/Feedback';
import { Field } from '@/components/Field';
import { EmptyLine, Row, Tabs } from '@/components/List';
import { NoAccess, NotFound } from '@/components/NoAccess';
import { FormActions, goBack, Page } from '@/components/Page';
import { Txt } from '@/components/Txt';
import { useRepo, useViewer } from '@/data/DataProvider';
import { Activity, Person, stageLabel } from '@/data/types';
import { AppData, isVisitor, useAppData } from '@/data/useAppData';
import { findActivity, previousRecord } from '@/domain/activities';
import { ChamadaState, faltam, markPresent, presentes, unmark } from '@/domain/chamada';
import { canRecordAttendance } from '@/domain/permissions';
import { fmtDayMonth, fmtRelativeDay, fmtTime, todayDay, weekdayShort } from '@/lib/dates';
import { normalize } from '@/lib/format';

export default function Chamada() {
  const { atividadeId } = useLocalSearchParams<{ atividadeId: string }>();
  const viewer = useViewer();
  const q = useAppData();
  if (!q.data) {
    return (
      <Page back="/frequencia" title="Chamada">
        <DataState error={q.error} reload={q.reload} what="a chamada" />
      </Page>
    );
  }
  const a = findActivity(atividadeId, q.data.services, q.data.events);
  if (!a) return <NotFound back="/frequencia" what="Atividade" />;
  if (!canRecordAttendance(viewer, a, q.data.ministries)) return <NoAccess back="/frequencia" what="registrar a frequência desta atividade" />;
  return <Lista key={a.id} d={q.data} a={a} />;
}

function Lista({ d, a }: { d: AppData; a: Activity }) {
  const viewer = useViewer();
  const repo = useRepo();
  const { toast } = useFeedback();
  const today = todayDay();
  const record = d.attendance.find((r) => r.activityId === a.id);
  // lista: a turma/célula; sem lista definida, todos os membros ativos e visitantes em acompanhamento
  const roster = useMemo(
    () => a.rosterIds ?? d.people.filter((p) => (p.kind === 'membro' && p.active) || isVisitor(p)).sort((x, y) => x.name.localeCompare(y.name, 'pt-BR')).map((p) => p.id),
    [a.rosterIds, d.people],
  );
  const [state, setState] = useState<ChamadaState>({ roster, present: record?.presentIds ?? [] });
  const [tab, setTab] = useState<'faltam' | 'presentes'>('faltam');
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);
  // `apply` é o único caminho que muda o estado e atualiza os dois juntos
  const stateRef = useRef(state);

  const prev = previousRecord(d.attendance, { activityId: a.id, date: a.date });
  const persist = (s: ChamadaState) => repo.saveChamada({ activityId: a.id, title: a.title, date: a.date, presentIds: s.present, done: !!record?.done }, viewer.userId);

  const apply = (next: ChamadaState) => {
    setState(next);
    stateRef.current = next;
    persist(next); // rascunho salvo a cada marcação
  };
  const mark = (p: Person) => {
    apply(markPresent(stateRef.current, p.id));
    toast(`${p.name}: presente`, () => apply(unmark(stateRef.current, p.id)));
  };
  const unmarkP = (p: Person) => {
    apply(unmark(stateRef.current, p.id));
    toast(`${p.name}: voltou para Faltam`, () => apply(markPresent(stateRef.current, p.id)));
  };
  const conclude = async () => {
    setSaving(true);
    const undo = await repo.saveChamada({ activityId: a.id, title: a.title, date: a.date, presentIds: stateRef.current.present, done: true }, viewer.userId);
    goBack('/frequencia');
    toast(`Chamada concluída: ${stateRef.current.present.length} presentes`, undo);
  };

  const context = (p: Person) => {
    const missedPrev = prev?.presentIds && !prev.presentIds.includes(p.id) && prev.presentIds.length > 0;
    const parts: string[] = [];
    if (isVisitor(p)) parts.push(`Visitante · ${stageLabel(p.followUp!.stage).toLowerCase()}`);
    else {
      const ms = p.ministries.map((m) => d.ministries.find((x) => x.id === m.ministryId)?.name).filter(Boolean);
      if (ms.length) parts.push(ms.slice(0, 2).join(', '));
    }
    if (missedPrev) parts.push(`Faltou também em ${fmtDayMonth(prev!.date)}`);
    return parts.join(' · ');
  };

  const n = normalize(filter);
  const show = (ids: string[]) => ids.map((id) => d.byId.get(id)).filter((p): p is Person => !!p && (!n || normalize(p.name).includes(n)));
  const missing = show(faltam(state));
  const here = show(presentes(state));
  const rel = fmtRelativeDay(a.date, today);
  const when = `${rel}${['Hoje', 'Ontem'].includes(rel) ? `, ${weekdayShort(a.date).toLowerCase()} ${fmtDayMonth(a.date)}` : ''} · ${fmtTime(a.time)} · ${a.location}`;
  const concludeBtn = <Button kind="primary" main label={record?.done ? 'Salvar chamada' : 'Concluir chamada'} loading={saving} onPress={conclude} />;

  return (
    <Page
      back="/frequencia"
      title={a.group ? `${a.title} · ${a.group}` : a.title}
      subtitle={when}
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label="Novo visitante" onPress={() => router.push('/visitantes/novo')} style={{ flex: 1 }} block />
          <View style={{ flex: 1 }}>{concludeBtn}</View>
        </View>
      }
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, alignItems: 'center' }}>
        <Txt v="small" muted>
          Chamada nominal{a.mode === 'chamada' ? ` · padrão para ${a.title.startsWith('EBD') ? 'a EBD' : 'esta atividade'}` : ''}
        </Txt>
        <TextLink small label="Usar contagem" onPress={() => router.replace(`/frequencia/contagem?atividade=${encodeURIComponent(a.id)}`)} />
      </View>
      {roster.length > 20 ? <Field label="Filtrar por nome" value={filter} onChangeText={setFilter} /> : null}
      <Tabs<'faltam' | 'presentes'>
        label="Chamada"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'faltam', label: 'Faltam', count: faltam(state).length },
          { value: 'presentes', label: 'Presentes', count: state.present.length },
        ]}
      />
      <View>
        {(tab === 'faltam' ? missing : here).length === 0 ? (
          <EmptyLine>
            <Txt muted>{tab === 'faltam' ? (filter ? 'Ninguém com esse nome em Faltam.' : 'Todos marcados como presentes.') : 'Ninguém marcado ainda. Toque em um nome em Faltam.'}</Txt>
          </EmptyLine>
        ) : (
          (tab === 'faltam' ? missing : here).slice(0, 200).map((p) => (
            <Row
              key={p.id}
              title={p.name}
              subtitle={context(p) || undefined}
              right={<Txt v="small" muted>{tab === 'faltam' ? 'Marcar presente' : 'Desmarcar'}</Txt>}
              accessibilityLabel={tab === 'faltam' ? `Marcar ${p.name} como presente` : `Desmarcar ${p.name}`}
              onPress={() => (tab === 'faltam' ? mark(p) : unmarkP(p))}
            />
          ))
        )}
      </View>
      <FormActions>
        {concludeBtn}
        <Button label="Novo visitante" onPress={() => router.push('/visitantes/novo')} />
      </FormActions>
    </Page>
  );
}
