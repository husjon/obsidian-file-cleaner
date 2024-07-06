import {
  App,
  ButtonComponent,
  Modal,
  TAbstractFile,
  TFile,
  TFolder,
} from "obsidian";
import translate from "./i18n";

export class ConfirmationModal extends Modal {
  title: string;
  content: HTMLElement;
  onConfirm: () => void;

  constructor(
    app: App,
    title: string,
    content: HTMLElement,
    onConfirm: () => void,
  ) {
    super(app);
    this.title = title;
    this.content = content;
    this.onConfirm = onConfirm;
  }
  onOpen(): void {
    this.titleEl.innerText = this.title;

    const contentContainer = this.contentEl.createDiv();
    contentContainer.append(this.content);

    const buttonContainer = this.contentEl.createDiv();
    buttonContainer.setCssStyles({
      cssFloat: "right",
      display: "flex",
      gap: "0.5em",
    });

    new ButtonComponent(buttonContainer)
      .setButtonText(translate().Modals.ButtonConfirm)
      .setWarning()
      .onClick(() => {
        this.onConfirm?.();
        this.close();
      });

    new ButtonComponent(buttonContainer)
      .setButtonText(translate().Modals.ButtonCancel)
      .onClick(() => {
        this.close();
      });
  }
}

function checkbox(
  app: App,
  parentEl: Node,
  file: TAbstractFile,
  checked: boolean,
  onUpdate?: (file: TAbstractFile, checked: boolean) => {} | void,
) {
  const checkboxEl = parentEl.createDiv();
  const input = checkboxEl.createEl("input");
  input.type = "checkbox";
  input.id = file.path;
  input.checked = checked;

  const label = checkboxEl.createEl("a", { text: file.path });
  label.onClickEvent(async () => {
    const leaf = app.workspace.getLeaf();
    leaf.openFile(file as TFile);
  });
  input.onClickEvent((e) => onUpdate(file, input.checked));
}
interface DeletionConfirmationModalProps {
  app: App;
  files: Set<TAbstractFile>;
  onConfirm?: () => void;
}
export function DeletionConfirmationModal({
  app,
  files: filesAndFolders,
  onConfirm,
}: DeletionConfirmationModalProps) {
  const modal = new ConfirmationModal(
    app,
    translate().Modals.DeletionConfirmation.Title,
    createEl("p", {
      text: translate().Modals.DeletionConfirmation.Text,
    }),
    onConfirm,
  );

  function updateItems(file: TAbstractFile, checked: boolean) {
    if (checked) filesAndFolders.add(file);
    else filesAndFolders.delete(file);
  }

  const filesEl = modal.content.createDiv();
  const foldersEl = modal.content.createDiv();

  const files = [...filesAndFolders].filter((file) => file instanceof TFile);
  if (files.length > 0) {
    filesEl.createEl("p", {
      text: translate().Modals.DeletionConfirmation.Files + ":",
    }).style.marginBottom = "0.25rem";
    files.map((file) => {
      checkbox(app, filesEl, file, filesAndFolders.has(file), updateItems);
    });
  }

  const folders = [...filesAndFolders].filter(
    (file) => file instanceof TFolder,
  );
  if (folders.length > 0) {
    foldersEl.createEl("p", {
      text: translate().Modals.DeletionConfirmation.Folders + ":",
    }).style.marginBottom = "0.25rem";
    folders.map((file) => {
      checkbox(app, foldersEl, file, filesAndFolders.has(file), updateItems);
    });
  }

  modal.content.createEl("p", {
    text: translate().Modals.DeletionConfirmation.Note,
  });

  modal.open();
}

interface ResetSettingsModalProps {
  app: App;
  onConfirm?: () => void;
}
export function ResetSettingsModal({
  app,
  onConfirm,
}: ResetSettingsModalProps) {
  const modal = new ConfirmationModal(
    app,
    translate().Modals.ResetSettings.Title,
    createEl("p", { text: translate().Modals.ResetSettings.Text }),
    onConfirm,
  );

  modal.open();
}
