import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { DataState } from '@/components/DataState';
import { useFeedback } from '@/components/Feedback';
import { Field } from '@/components/Field';
import { Detail, Page } from '@/components/Page';
import { Txt } from '@/components/Txt';
import { useQuery, useRepo } from '@/data/DataProvider';
import { findActivity } from '@/domain/activities';
import { fmtDayLong, fmtDayShort, fmtTime } from '@/lib/dates';
import { firstName } from '@/lib/format';

/** Confirmar escala por link, sem login. A resposta aparece na escala do líder. */
export default function ConfirmarEscala() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const repo = useRepo();
  const { toast } = useFeedback();
  const q = useQuery(async (r) => ({
    church: await r.getChurch(),
    schedules: await r.listSchedules(),
    people: await r.listPeople(),
    ministries: await r.listMinistries(),
    services: await r.listServices(),
    events: await r.listEvents(),
  }));
  const [message, setMessage] = useState('');
  // o recado vale só para o link em que foi enviado
  const [sentFor, setSentFor] = useState<string | null>(null);
  const sentMsg = sentFor === id;

  if (!q.data) {
    return (
      <Page bare maxWidth={480} title="Escala">
        <DataState error={q.error} reload={q.reload} what="a escala" />
      </Page>
    );
  }
  const d = q.data;
  const schedule = d.schedules.find((s) => s.slots.some((x) => x.id === id));
  const slot = schedule?.slots.find((x) => x.id === id);
  const person = d.people.find((p) => p.id === slot?.personId);
  const ministry = d.ministries.find((m) => m.id === schedule?.ministryId);
  const activity = schedule ? findActivity(schedule.activityId, d.services, d.events) : null;
  if (!schedule || !slot || !person || !ministry || !activity) {
    return (
      <Page bare maxWidth={480} title="Link inválido" subtitle={d.church.name}>
        <Txt muted>Este link de escala não vale mais: a escala pode ter mudado. Fale com o líder do ministério.</Txt>
      </Page>
    );
  }
  const leader = d.people.find((p) => p.id === ministry.leaderId);
  const leaderName = leader?.name ?? 'o líder';
  const name = firstName(person.name);
  const header = `${d.church.name} · ${ministry.name}`;
  const respond = async (r: 'confirmado' | 'recusou' | 'aguardando', msg?: string) => {
    await repo.respondSlot(slot.id, r, msg);
  };
  const part = activity.title.match(/ – (noite|manhã)$/)?.[1];
  const whenText = `${fmtDayLong(activity.date).replace(/^(\w)/, (c) => c.toLowerCase())}${part ? `, ${part === 'noite' ? 'à noite' : 'de manhã'}` : ''}`;

  if (slot.status === 'recusou') {
    return (
      <Page bare maxWidth={480} title={`Tudo bem, ${name}`} subtitle={header}>
        <Txt>
          Avisamos {leaderName} que você não pode no {whenText}.
        </Txt>
        {sentMsg || slot.message ? (
          <Txt muted>Recado enviado: “{slot.message ?? message}”</Txt>
        ) : (
          <>
            <Field label="Quer deixar um recado?" optional value={message} onChangeText={setMessage} multiline placeholder="Ex.: Vou estar viajando a trabalho. No dia 29 eu posso." />
            <Button
              label="Enviar recado"
              disabled={!message.trim()}
              onPress={async () => {
                await respond('recusou', message);
                setSentFor(id);
                toast('Recado enviado');
              }}
            />
          </>
        )}
        <Button kind="text" label="Mudei de ideia, posso ir" onPress={() => respond('confirmado')} />
      </Page>
    );
  }

  if (slot.status === 'confirmado') {
    return (
      <Page bare maxWidth={480} title={`Presença confirmada, ${name}`} subtitle={header}>
        <Txt>
          {slot.role} no {activity.title.toLowerCase()}, {fmtDayShort(activity.date).toLowerCase()} às {fmtTime(activity.time)}. {leaderName} já sabe.
        </Txt>
        <Button kind="text" label="Mudei de ideia, não posso" onPress={() => respond('recusou')} />
      </Page>
    );
  }

  return (
    <Page bare maxWidth={480} title={`${name}, você foi escalado para ${slot.role}`} subtitle={header}>
      <Txt w={500}>{activity.title}</Txt>
      <View>
        <Detail label="Quando">
          <Txt tabular>
            {fmtDayShort(activity.date)} · {fmtTime(activity.time)}
            {schedule.arrival ? ` · chegar às ${fmtTime(schedule.arrival)}` : ''}
          </Txt>
        </Detail>
        {schedule.rehearsal ? (
          <Detail label="Ensaio">
            <Txt tabular>
              {fmtDayShort(schedule.rehearsal.date)} · {fmtTime(schedule.rehearsal.time)} · {schedule.rehearsal.location}
            </Txt>
          </Detail>
        ) : null}
        <Detail label="Líder">{leaderName}</Detail>
      </View>
      <Txt v="small" muted>
        Se não puder, avisamos {firstName(leaderName)} na hora para escalar outra pessoa. Este link vale só para esta escala.
      </Txt>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Não posso" onPress={() => respond('recusou')} style={{ flex: 1 }} block />
        <Button kind="primary" label="Confirmar" onPress={() => respond('confirmado')} style={{ flex: 1 }} block />
      </View>
    </Page>
  );
}

