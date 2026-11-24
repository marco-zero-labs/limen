import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Button, TextLink } from '@/components/Button';
import { DataState } from '@/components/DataState';
import { useFeedback } from '@/components/Feedback';
import { Choice } from '@/components/Field';
import { NoAccess } from '@/components/NoAccess';
import { FormActions, goBack, Page } from '@/components/Page';
import { Txt } from '@/components/Txt';
import { useRepo, useViewer } from '@/data/DataProvider';
import { Activity } from '@/data/types';
import { AppData, useAppData } from '@/data/useAppData';
import { activitiesBetween, findActivity, previousRecord, priorAverage } from '@/domain/activities';
import { canRecordAttendance } from '@/domain/permissions';
import { addDays, fmtDayMonth, fmtRelativeDay, fmtTime, toDateTime, todayDay, weekdayShort } from '@/lib/dates';
import { onlyDigits } from '@/lib/format';
import { colors, fonts, radius } from '@/theme/tokens';

/** Atividades que já começaram nos últimos 7 dias e que o usuário pode registrar. */
function recentActivities(d: AppData, viewer: ReturnType<typeof useViewer>): Activity[] {
  const today = todayDay();
  const now = toDateTime(new Date());
  return activitiesBetween(d.services, d.events, addDays(today, -7), today)
    .filter((a) => `${a.date}T${a.time}` <= now)
    .filter((a) => canRecordAttendance(viewer, a, d.ministries))
    .reverse();
}

export default function Contagem() {
  const { atividade } = useLocalSearchParams<{ atividade?: string }>();
  const viewer = useViewer();
  const q = useAppData();
  if (!q.data) {
    return (
      <Page back="/frequencia" title="Contagem">
        <DataState error={q.error} reload={q.reload} />
      </Page>
    );
  }
  const d = q.data;
  const recent = recentActivities(d, viewer).filter((a) => a.mode === 'contagem' || a.id === atividade);
  const chosen = atividade ? findActivity(atividade, d.services, d.events) : recent.find((a) => !d.attendance.some((r) => r.activityId === a.id && r.done)) ?? recent[0] ?? null;
  if (!chosen) {
    return (
      <Page back="/frequencia" title="Registrar frequência">
        <Txt muted>Nenhuma atividade sua aconteceu nos últimos 7 dias.</Txt>
      </Page>
    );
  }
  if (!canRecordAttendance(viewer, chosen, d.ministries)) return <NoAccess back="/frequencia" what="registrar a frequência desta atividade" />;
  return <Form key={chosen.id} d={d} activity={chosen} options={recent} />;
}

function Form({ d, activity, options }: { d: AppData; activity: Activity; options: Activity[] }) {
  const viewer = useViewer();
  const repo = useRepo();
  const { toast } = useFeedback();
  const existing = d.attendance.find((r) => r.activityId === activity.id);
  const prev = previousRecord(d.attendance, { activityId: activity.id, date: activity.date });
  const avg = priorAverage(d.attendance, { activityId: activity.id, date: activity.date });
  const [present, setPresent] = useState(existing?.present ?? 0);
  const [visitors, setVisitors] = useState(existing?.visitors ?? 0);
  const [children, setChildren] = useState(existing?.children ?? 0);
  const [choosing, setChoosing] = useState(false);
  const [saving, setSaving] = useState(false);
  const today = todayDay();

  const save = async () => {
    setSaving(true);
    try {
      const undo = await repo.saveCount({ activityId: activity.id, title: activity.title, date: activity.date, present, visitors, children }, viewer.userId);
      goBack('/frequencia');
      toast(`Contagem salva: ${present} presentes`, undo);
    } catch (e) {
      setSaving(false);
      toast(`Não foi possível salvar: ${(e as Error).message}`);
    }
  };
  const saveBtn = <Button kind="primary" main label="Salvar contagem" loading={saving} onPress={save} />;
  const when = `${fmtRelativeDay(activity.date, today)}${['Hoje', 'Ontem'].includes(fmtRelativeDay(activity.date, today)) ? `, ${weekdayShort(activity.date).toLowerCase()} ${fmtDayMonth(activity.date)}` : ''} · ${fmtTime(activity.time)}`;

  return (
    <Page back="/frequencia" title={activity.title} subtitle={when} footer={saveBtn}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, alignItems: 'center' }}>
        <Txt v="small" muted>
          Contagem{activity.mode === 'contagem' ? ' · padrão para cultos' : ''}
        </Txt>
        <TextLink small label="Usar chamada nominal" onPress={() => router.replace(`/frequencia/chamada/${activity.id}`)} />
        {options.length > 1 ? <TextLink small label={choosing ? 'Fechar' : 'Trocar atividade'} onPress={() => setChoosing((c) => !c)} /> : null}
      </View>
      {choosing ? (
        <Choice<string>
          label="Atividade"
          layout="list"
          value={activity.id}
          onChange={(id) => router.setParams({ atividade: id })}
          options={options.map((a) => ({ value: a.id, label: a.title, hint: `${fmtRelativeDay(a.date, today)} · ${fmtTime(a.time)}${d.attendance.some((r) => r.activityId === a.id && r.done) ? ' · já registrada' : ''}` }))}
        />
      ) : null}

      {prev || avg != null ? (
        <View style={{ flexDirection: 'row', gap: 32 }}>
          {prev ? <Ref label={activity.source === 'service' ? 'Semana passada' : `Anterior (${fmtDayMonth(prev.date)})`} value={prev.present} /> : null}
          {avg != null ? <Ref label="Média de 4 semanas" value={Math.round(avg)} /> : null}
        </View>
      ) : null}

      <Txt v="small" muted>
        Toque no número para digitar.
      </Txt>
      <Counter label="Presentes" hint="Total, incluindo visitantes e crianças" value={present} onChange={setPresent} before={prev ? `${fmtDayMonth(prev.date)}: ${prev.present}` : undefined} />
      <Counter label="Visitantes novos" value={visitors} onChange={setVisitors} before={prev ? `${fmtDayMonth(prev.date)}: ${prev.visitors}` : undefined} />
      <Counter label="Crianças" hint="Na sala do Infantil" value={children} onChange={setChildren} before={prev ? `${fmtDayMonth(prev.date)}: ${prev.children}` : undefined} />
      {visitors + children > present && present > 0 ? <Txt v="small" color={colors.amberText} w={500}>Visitantes e crianças somam mais que o total de presentes. Confira.</Txt> : null}

      <Txt v="small" muted>
        Contado por {d.name(viewer.userId)}
      </Txt>
      <FormActions>
        {saveBtn}
        <Button kind="text" label="Cancelar" onPress={() => goBack('/frequencia')} />
      </FormActions>
    </Page>
  );
}

function Ref({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ gap: 2 }}>
      <Txt v="label" color={colors.inkHead}>
        {label}
      </Txt>
      <Txt v="number" tabular>
        {value}
      </Txt>
    </View>
  );
}

/** − e + grandes, com o número editável no meio. */
function Counter({ label, hint, value, onChange, before }: { label: string; hint?: string; value: number; onChange: (n: number) => void; before?: string }) {
  const [text, setText] = useState(String(value));
  // quando o valor muda por fora (− ou +), o texto acompanha
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    setText(String(value));
  }
  const step = (n: number) => onChange(Math.max(0, value + n));
  const btn = (sign: '−' | '+', n: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${n > 0 ? 'Mais' : 'Menos'} um em ${label}`}
      onPress={() => step(n)}
      style={(s) => ({
        width: 56,
        height: 56,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.field,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: s.pressed || (s as { hovered?: boolean }).hovered ? colors.hover : colors.surface,
      })}
    >
      <Txt w={500} style={{ fontSize: 24, lineHeight: 28 }}>
        {sign}
      </Txt>
    </Pressable>
  );
  return (
    <View style={{ gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt w={500}>{label}</Txt>
          {hint ? (
            <Txt v="small" muted>
              {hint}
            </Txt>
          ) : null}
        </View>
        {before ? (
          <Txt v="small" muted tabular>
            {before}
          </Txt>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {btn('−', -1)}
        <TextInput
          accessibilityLabel={label}
          value={text}
          onChangeText={(s) => {
            const digits = onlyDigits(s).slice(0, 5);
            setText(digits);
            if (digits !== '') onChange(Number(digits));
          }}
          onBlur={() => setText(String(value))}
          keyboardType="number-pad"
          selectTextOnFocus
          style={{
            flex: 1,
            maxWidth: 160,
            height: 56,
            borderWidth: 1,
            borderColor: colors.field,
            borderRadius: radius.md,
            textAlign: 'center',
            fontFamily: fonts[500],
            fontSize: 28,
            color: colors.ink,
            fontVariant: ['tabular-nums'],
          }}
        />
        {btn('+', 1)}
      </View>
    </View>
  );
}
