import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import type { Materia } from "@/data/mock";
import { supabase } from "@/lib/supabase";

interface MateriasContextType {
  materias: Materia[];
  loading: boolean;
  error: string | null;
  addMateria: (materia: Omit<Materia, "id">) => Promise<void>;
  updateMateria: (id: number, materia: Partial<Materia>) => Promise<void>;
  deleteMateria: (id: number) => Promise<void>;
  getMateriaById: (id: number) => Materia | undefined;
  refetchMaterias: () => Promise<void>;
}

const MateriasContext = createContext<MateriasContextType | undefined>(
  undefined,
);

export function MateriasProvider({ children }: { children: ReactNode }) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterias = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from("Materia")
        .select("*")
        .order("nome", { ascending: true });

      if (supabaseError) throw supabaseError;
      setMaterias(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar matérias");
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const addMateria = async (materia: Omit<Materia, "id">) => {
    try {
      const { error: supabaseError } = await supabase
        .from("Materia")
        .insert([materia]);
      if (supabaseError) throw supabaseError;
      await fetchMaterias();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar matéria");
      throw err;
    }
  };

  const updateMateria = async (id: number, updates: Partial<Materia>) => {
    try {
      const { error: supabaseError } = await supabase
        .from("Materia")
        .update(updates)
        .eq("id", id);
      if (supabaseError) throw supabaseError;
      await fetchMaterias();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar matéria",
      );
      throw err;
    }
  };

  const deleteMateria = async (id: number) => {
    try {
      const { error: supabaseError } = await supabase
        .from("Materia")
        .delete()
        .eq("id", id);
      if (supabaseError) throw supabaseError;
      await fetchMaterias();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar matéria");
      throw err;
    }
  };

  const getMateriaById = (id: number) => {
    return materias.find((m) => m.id === id);
  };

  return (
    <MateriasContext.Provider
      value={{
        materias,
        loading,
        error,
        addMateria,
        updateMateria,
        deleteMateria,
        getMateriaById,
        refetchMaterias: fetchMaterias,
      }}
    >
      {children}
    </MateriasContext.Provider>
  );
}

export function useMaterias() {
  const context = useContext(MateriasContext);
  if (context === undefined) {
    throw new Error("useMaterias must be used within MateriasProvider");
  }
  return context;
}
