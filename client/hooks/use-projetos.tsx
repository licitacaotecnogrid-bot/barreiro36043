import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useProfessores } from "@/hooks/use-professores";

export interface ProjetoPesquisa {
  id: number;
  titulo: string;
  areaTematica: string;
  descricao: string;
  momentoOcorre: string;
  problemaPesquisa: string;
  metodologia: string;
  resultadosEsperados: string;
  imagem?: string | null;
  curso?: string;
  professorCoordenadorId: number;
}

export interface ProjetoExtensao {
  id: number;
  titulo: string;
  areaTematica: string;
  descricao: string;
  momentoOcorre: string;
  tipoPessoasProcuram: string;
  comunidadeEnvolvida: string;
  imagem?: string | null;
  curso?: string;
  professorCoordenadorId: number;
}

interface ProjetosContextType {
  projetosPesquisa: ProjetoPesquisa[];
  projetosExtensao: ProjetoExtensao[];
  projetosPesquisadoCurso: ProjetoPesquisa[];
  projetosExtensaodoCurso: ProjetoExtensao[];
  loading: boolean;
  error: string | null;
  addProjetoPesquisa: (projeto: Omit<ProjetoPesquisa, "id">) => Promise<void>;
  updateProjetoPesquisa: (
    id: number,
    projeto: Partial<ProjetoPesquisa>,
  ) => Promise<void>;
  deleteProjetoPesquisa: (id: number) => Promise<void>;
  addProjetoExtensao: (projeto: Omit<ProjetoExtensao, "id">) => Promise<void>;
  updateProjetoExtensao: (
    id: number,
    projeto: Partial<ProjetoExtensao>,
  ) => Promise<void>;
  deleteProjetoExtensao: (id: number) => Promise<void>;
  getProjetoPesquisaById: (id: number) => ProjetoPesquisa | undefined;
  getProjetoExtensaoById: (id: number) => ProjetoExtensao | undefined;
  getProjetosPesquisaByProfessor: (professorId: number) => ProjetoPesquisa[];
  getProjetosExtensaoByProfessor: (professorId: number) => ProjetoExtensao[];
  refetchProjetos: () => Promise<void>;
}

const ProjetosContext = createContext<ProjetosContextType | undefined>(
  undefined,
);

export function ProjetosProvider({ children }: { children: ReactNode }) {
  const [projetosPesquisa, setProjetosPesquisa] = useState<ProjetoPesquisa[]>(
    [],
  );
  const [projetosExtensao, setProjetosExtensao] = useState<ProjetoExtensao[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();
  const { professores } = useProfessores();

  const fetchProjetos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pesquisaData, extensaoData] = await Promise.all([
        supabase
          .from("ProjetoPesquisa")
          .select("*")
          .order("createdAt", { ascending: false }),
        supabase
          .from("ProjetoExtensao")
          .select("*")
          .order("createdAt", { ascending: false }),
      ]);

      if (pesquisaData.error || extensaoData.error)
        throw pesquisaData.error || extensaoData.error;

      setProjetosPesquisa(pesquisaData.data || []);
      setProjetosExtensao(extensaoData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar projetos");
      setProjetosPesquisa([]);
      setProjetosExtensao([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, []);

  const addProjetoPesquisa = async (projeto: Omit<ProjetoPesquisa, "id">) => {
    try {
      const { error: supabaseError } = await supabase
        .from("ProjetoPesquisa")
        .insert([projeto]);
      if (supabaseError) throw supabaseError;
      await fetchProjetos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar projeto");
      throw err;
    }
  };

  const updateProjetoPesquisa = async (
    id: number,
    updates: Partial<ProjetoPesquisa>,
  ) => {
    try {
      const { error: supabaseError } = await supabase
        .from("ProjetoPesquisa")
        .update(updates)
        .eq("id", id);
      if (supabaseError) throw supabaseError;
      await fetchProjetos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar projeto",
      );
      throw err;
    }
  };

  const deleteProjetoPesquisa = async (id: number) => {
    try {
      const { error: supabaseError } = await supabase
        .from("ProjetoPesquisa")
        .delete()
        .eq("id", id);
      if (supabaseError) throw supabaseError;
      await fetchProjetos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar projeto");
      throw err;
    }
  };

  const addProjetoExtensao = async (projeto: Omit<ProjetoExtensao, "id">) => {
    try {
      const { error: supabaseError } = await supabase
        .from("ProjetoExtensao")
        .insert([projeto]);
      if (supabaseError) throw supabaseError;
      await fetchProjetos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar projeto");
      throw err;
    }
  };

  const updateProjetoExtensao = async (
    id: number,
    updates: Partial<ProjetoExtensao>,
  ) => {
    try {
      const { error: supabaseError } = await supabase
        .from("ProjetoExtensao")
        .update(updates)
        .eq("id", id);
      if (supabaseError) throw supabaseError;
      await fetchProjetos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar projeto",
      );
      throw err;
    }
  };

  const deleteProjetoExtensao = async (id: number) => {
    try {
      const { error: supabaseError } = await supabase
        .from("ProjetoExtensao")
        .delete()
        .eq("id", id);
      if (supabaseError) throw supabaseError;
      await fetchProjetos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar projeto");
      throw err;
    }
  };

  const getProjetoPesquisaById = (id: number) => {
    return projetosPesquisa.find((p) => p.id === id);
  };

  const getProjetoExtensaoById = (id: number) => {
    return projetosExtensao.find((p) => p.id === id);
  };

  const getProjetosPesquisaByProfessor = (professorId: number) => {
    return projetosPesquisa.filter(
      (p) => p.professorCoordenadorId === professorId,
    );
  };

  const getProjetosExtensaoByProfessor = (professorId: number) => {
    return projetosExtensao.filter(
      (p) => p.professorCoordenadorId === professorId,
    );
  };

  const projetosPesquisadoCurso = currentUser?.curso
    ? projetosPesquisa.filter((p) => p.curso === currentUser.curso)
    : projetosPesquisa;

  const projetosExtensaodoCurso = currentUser?.curso
    ? projetosExtensao.filter((p) => p.curso === currentUser.curso)
    : projetosExtensao;

  return (
    <ProjetosContext.Provider
      value={{
        projetosPesquisa,
        projetosExtensao,
        projetosPesquisadoCurso,
        projetosExtensaodoCurso,
        loading,
        error,
        addProjetoPesquisa,
        updateProjetoPesquisa,
        deleteProjetoPesquisa,
        addProjetoExtensao,
        updateProjetoExtensao,
        deleteProjetoExtensao,
        getProjetoPesquisaById,
        getProjetoExtensaoById,
        getProjetosPesquisaByProfessor,
        getProjetosExtensaoByProfessor,
        refetchProjetos: fetchProjetos,
      }}
    >
      {children}
    </ProjetosContext.Provider>
  );
}

export function useProjetos() {
  const context = useContext(ProjetosContext);
  if (context === undefined) {
    throw new Error("useProjetos must be used within ProjetosProvider");
  }
  return context;
}
