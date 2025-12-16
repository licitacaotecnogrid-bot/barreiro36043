import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { Status } from "@/data/mock";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/hooks/use-current-user";

export interface OdsEvento {
  id: number;
  eventoId: number;
  odsNumero: number;
  criadoEm: string;
}

export interface AnexoEvento {
  id: number;
  eventoId: number;
  nome: string;
  criadoEm: string;
}

export interface Evento {
  id: number;
  titulo: string;
  data: string;
  responsavel: string;
  status: Status;
  local?: string | null;
  curso: string;
  tipoEvento: string;
  modalidade: string;
  descricao?: string | null;
  imagem?: string | null;
  documento?: string | null;
  link?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  odsAssociadas: OdsEvento[];
  anexos: AnexoEvento[];
}

interface EventsContextType {
  eventos: Evento[];
  eventosdoCurso: Evento[];
  loading: boolean;
  error: string | null;
  addEvento: (
    evento: Omit<Evento, "id" | "criadoEm" | "atualizadoEm">,
  ) => Promise<void>;
  updateEvento: (id: number, evento: Partial<Evento>) => Promise<void>;
  deleteEvento: (id: number) => Promise<void>;
  refetchEventos: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  const fetchEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from("Evento")
        .select("*, OdsEvento(*), AnexoEvento(*)")
        .order("data", { ascending: false });

      if (supabaseError) throw supabaseError;
      setEventos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar eventos");
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const addEvento = async (
    evento: Omit<Evento, "id" | "criadoEm" | "atualizadoEm">,
  ) => {
    try {
      const { odsAssociadas, anexos, ...eventoData } = evento;

      const { data, error: supabaseError } = await supabase
        .from("Evento")
        .insert([eventoData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (odsAssociadas && data) {
        const odsInserts = odsAssociadas.map((ods) => ({
          eventoId: data.id,
          odsNumero: typeof ods === "number" ? ods : ods.odsNumero,
        }));

        const { error: odsError } = await supabase
          .from("OdsEvento")
          .insert(odsInserts);

        if (odsError) throw odsError;
      }

      await fetchEventos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar evento");
      throw err;
    }
  };

  const updateEvento = async (id: number, updates: Partial<Evento>) => {
    try {
      const { odsAssociadas, anexos, ...updateData } = updates;

      const { error: supabaseError } = await supabase
        .from("Evento")
        .update(updateData)
        .eq("id", id);

      if (supabaseError) throw supabaseError;

      if (odsAssociadas) {
        const { error: deleteError } = await supabase
          .from("OdsEvento")
          .delete()
          .eq("eventoId", id);

        if (deleteError) throw deleteError;

        const odsInserts = odsAssociadas.map((ods) => ({
          eventoId: id,
          odsNumero: typeof ods === "number" ? ods : ods.odsNumero,
        }));

        const { error: insertError } = await supabase
          .from("OdsEvento")
          .insert(odsInserts);

        if (insertError) throw insertError;
      }

      await fetchEventos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar evento");
      throw err;
    }
  };

  const deleteEvento = async (id: number) => {
    try {
      const { error: supabaseError } = await supabase
        .from("Evento")
        .delete()
        .eq("id", id);

      if (supabaseError) throw supabaseError;
      await fetchEventos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar evento");
      throw err;
    }
  };

  const eventosdoCurso = currentUser?.curso
    ? eventos.filter((e) => e.curso === currentUser.curso)
    : eventos;

  return (
    <EventsContext.Provider
      value={{
        eventos,
        eventosdoCurso,
        loading,
        error,
        addEvento,
        updateEvento,
        deleteEvento,
        refetchEventos: fetchEventos,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within EventsProvider");
  }
  return context;
}
