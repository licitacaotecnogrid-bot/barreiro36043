import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import type { ProfessorCoordenador } from "@/data/mock";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ProfessoresContextType {
  professores: ProfessorCoordenador[];
  professoresdoCurso: ProfessorCoordenador[];
  loading: boolean;
  error: string | null;
  addProfessor: (professor: Omit<ProfessorCoordenador, "id">) => Promise<void>;
  updateProfessor: (
    id: number,
    professor: Partial<ProfessorCoordenador>,
  ) => Promise<void>;
  deleteProfessor: (id: number) => Promise<void>;
  getProfessorById: (id: number) => ProfessorCoordenador | undefined;
  refetchProfessores: () => Promise<void>;
}

const ProfessoresContext = createContext<ProfessoresContextType | undefined>(
  undefined,
);

export function ProfessoresProvider({ children }: { children: ReactNode }) {
  const [professores, setProfessores] = useState<ProfessorCoordenador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  const fetchProfessores = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from("Usuario")
        .select("id, nome, email, senha, curso")
        .in("cargo", ["Professor", "Coordenador"]);

      if (supabaseError) throw supabaseError;

      const professorData: ProfessorCoordenador[] = (data || []).map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        senha: u.senha,
        curso: u.curso || "",
      }));

      setProfessores(professorData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao buscar professores",
      );
      setProfessores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  const addProfessor = async (professor: Omit<ProfessorCoordenador, "id">) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("Usuario")
        .insert([
          {
            nome: professor.nome,
            email: professor.email,
            senha: professor.senha,
            cargo: "Professor",
          },
        ])
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      await fetchProfessores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar professor");
      throw err;
    }
  };

  const updateProfessor = async (
    id: number,
    updates: Partial<ProfessorCoordenador>,
  ) => {
    try {
      const { error: supabaseError } = await supabase
        .from("Usuario")
        .update({
          nome: updates.nome,
          email: updates.email,
          senha: updates.senha,
        })
        .eq("id", id);

      if (supabaseError) throw supabaseError;
      await fetchProfessores();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar professor",
      );
      throw err;
    }
  };

  const deleteProfessor = async (id: number) => {
    try {
      const { error: supabaseError } = await supabase
        .from("Usuario")
        .delete()
        .eq("id", id);

      if (supabaseError) throw supabaseError;
      await fetchProfessores();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao deletar professor",
      );
      throw err;
    }
  };

  const getProfessorById = (id: number) => {
    return professores.find((p) => p.id === id);
  };

  const professoresdoCurso = currentUser?.curso
    ? professores.filter((p) => p.curso === currentUser.curso)
    : professores;

  return (
    <ProfessoresContext.Provider
      value={{
        professores,
        professoresdoCurso,
        loading,
        error,
        addProfessor,
        updateProfessor,
        deleteProfessor,
        getProfessorById,
        refetchProfessores: fetchProfessores,
      }}
    >
      {children}
    </ProfessoresContext.Provider>
  );
}

export function useProfessores() {
  const context = useContext(ProfessoresContext);
  if (context === undefined) {
    throw new Error("useProfessores must be used within ProfessoresProvider");
  }
  return context;
}
