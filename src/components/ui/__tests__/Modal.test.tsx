// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../Modal";

afterEach(cleanup);

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    title: "Título do Modal",
    children: <p>Conteúdo</p>,
  };
  return render(<Modal {...defaults} {...props} />);
}

describe("Modal", () => {
  describe("renderização condicional", () => {
    it("não renderiza nada quando open=false", () => {
      renderModal({ open: false });
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("renderiza o dialog quando open=true", () => {
      renderModal();
      expect(screen.getByRole("dialog")).toBeDefined();
    });

    it("exibe o título passado via prop", () => {
      renderModal({ title: "Meu Título" });
      expect(screen.getByText("Meu Título")).toBeDefined();
    });

    it("exibe os children", () => {
      renderModal({ children: <span>Filho do modal</span> });
      expect(screen.getByText("Filho do modal")).toBeDefined();
    });
  });

  describe("atributos de acessibilidade", () => {
    it("dialog tem aria-modal=true", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("dialog tem aria-labelledby apontando para o título", () => {
      renderModal({ title: "Teste" });
      const dialog = screen.getByRole("dialog");
      const labelledBy = dialog.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      const heading = document.getElementById(labelledBy!);
      expect(heading?.textContent).toBe("Teste");
    });

    it("botão fechar tem aria-label='Fechar'", () => {
      renderModal();
      expect(screen.getByLabelText("Fechar")).toBeDefined();
    });
  });

  describe("interações de fechamento", () => {
    it("clique no backdrop chama onClose", () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      // backdrop é o div absoluto logo antes do painel
      const dialog = screen.getByRole("dialog");
      const backdrop = dialog.querySelector(".absolute.inset-0") as HTMLElement;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("clique no botão ✕ chama onClose", async () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      await userEvent.click(screen.getByLabelText("Fechar"));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("tecla Escape chama onClose", async () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      await userEvent.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("scroll lock", () => {
    beforeEach(() => {
      document.body.classList.remove("overflow-hidden");
    });

    it("adiciona overflow-hidden ao body quando open=true", () => {
      renderModal({ open: true });
      expect(document.body.classList.contains("overflow-hidden")).toBe(true);
    });

    it("não adiciona overflow-hidden quando open=false", () => {
      renderModal({ open: false });
      expect(document.body.classList.contains("overflow-hidden")).toBe(false);
    });

    it("remove overflow-hidden ao desmontar", () => {
      const { unmount } = renderModal({ open: true });
      expect(document.body.classList.contains("overflow-hidden")).toBe(true);
      unmount();
      expect(document.body.classList.contains("overflow-hidden")).toBe(false);
    });
  });
});
