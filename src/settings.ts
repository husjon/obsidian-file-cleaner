import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import FileCleanerPlugin from ".";
import translate from "./i18n";
import { Deletion } from "./enums";
import { ResetSettingsModal } from "./modals";

export interface FileCleanerSettings {
  deletionDestination: Deletion;
  excludeInclude: ExcludeInclude;
  excludedFolders: string[];
  attachmentsExcludeInclude: ExcludeInclude;
  attachmentExtensions: string[];
  deletionConfirmation: boolean;
  runOnStartup: boolean;
  removeFolders: boolean;
  ignoredFrontmatter: string[];
}
export enum ExcludeInclude {
  Exclude = Number(false),
  Include = Number(true),
}

export const DEFAULT_SETTINGS: FileCleanerSettings = {
  deletionDestination: Deletion.SystemTrash,
  excludeInclude: ExcludeInclude.Exclude,
  excludedFolders: [],
  attachmentsExcludeInclude: ExcludeInclude.Include,
  attachmentExtensions: [],
  deletionConfirmation: true,
  runOnStartup: false,
  removeFolders: false,
  ignoredFrontmatter: [],
};

export class FileCleanerSettingTab extends PluginSettingTab {
  plugin: FileCleanerPlugin;

  constructor(app: App, plugin: FileCleanerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    this.containerEl.empty();

    //#region Regular Options {{{
    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.CleanedFiles.Label)
      .setDesc(translate().Settings.RegularOptions.CleanedFiles.Description)
      .addDropdown((dropdown) =>
        dropdown
          .addOption(
            "system",
            translate().Settings.RegularOptions.CleanedFiles.Options
              .MoveToSystemTrash,
          )
          .addOption(
            "obsidian",
            translate().Settings.RegularOptions.CleanedFiles.Options
              .MoveToObsidianTrash,
          )
          .addOption(
            "permanent",
            translate().Settings.RegularOptions.CleanedFiles.Options
              .PermanentDelete,
          )
          .setValue(this.plugin.settings.deletionDestination)
          .onChange((value) => {
            switch (value) {
              case Deletion.Permanent:
                this.plugin.settings.deletionDestination = Deletion.Permanent;
                break;

              case Deletion.ObsidianTrash:
                this.plugin.settings.deletionDestination =
                  Deletion.ObsidianTrash;
                break;

              default:
              case Deletion.SystemTrash:
                this.plugin.settings.deletionDestination = Deletion.SystemTrash;
                break;
            }
            this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.FolderFiltering.Label)
      .setDesc(translate().Settings.RegularOptions.FolderFiltering.Description)
      .addToggle((toggle) => {
        toggle.setValue(Boolean(this.plugin.settings.excludeInclude));

        toggle.onChange((value) => {
          this.plugin.settings.excludeInclude = Number(value);
          this.plugin.saveSettings();
          this.display();
        });
      });

    new Setting(containerEl)
      .setName(
        this.plugin.settings.excludeInclude
          ? translate().Settings.RegularOptions.FolderFiltering.Included.Label
          : translate().Settings.RegularOptions.FolderFiltering.Excluded.Label,
      )
      .setDesc(
        this.plugin.settings.excludeInclude
          ? translate().Settings.RegularOptions.FolderFiltering.Included
              .Description
          : translate().Settings.RegularOptions.FolderFiltering.Excluded
              .Description,
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.excludedFolders.join("\n"))
          .onChange(async (value) => {
            this.plugin.settings.excludedFolders = value
              .split(/\n/)
              .map((ext) => ext.trim())
              .filter((ext) => ext !== "");

            this.plugin.saveSettings();
          });
        text.setPlaceholder(
          translate().Settings.RegularOptions.FolderFiltering.Placeholder,
        );
        text.inputEl.rows = 8;
        text.inputEl.cols = 30;
      });

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.Attachments.Label)
      .setDesc(translate().Settings.RegularOptions.Attachments.Description)
      .addToggle((toggle) => {
        toggle.setValue(
          Boolean(this.plugin.settings.attachmentsExcludeInclude),
        );

        toggle.onChange((value) => {
          this.plugin.settings.attachmentsExcludeInclude = Number(value);
          this.plugin.saveSettings();
          this.display();
        });
      });
    new Setting(containerEl)
      .setName(
        this.plugin.settings.attachmentsExcludeInclude
          ? translate().Settings.RegularOptions.Attachments.Included.Label
          : translate().Settings.RegularOptions.Attachments.Excluded.Label,
      )
      .setDesc(
        this.plugin.settings.attachmentsExcludeInclude
          ? translate().Settings.RegularOptions.Attachments.Included.Description
          : translate().Settings.RegularOptions.Attachments.Excluded
              .Description,
      )
      .addTextArea((text) => {
        text
          .setValue(
            this.plugin.settings.attachmentExtensions
              .map((ext) => `.${ext}`)
              .join(", "),
          )
          .onChange(async (value) => {
            this.plugin.settings.attachmentExtensions = value
              .split(",")
              .map((ext) => ext.trim())
              .filter((ext) => ext.startsWith(".") && ext.length > 1)
              .filter((ext) => ext !== "")
              .map((ext) => ext.replace(/^\./, ""));

            this.plugin.saveSettings();
          });
        text.setPlaceholder(
          this.plugin.settings.attachmentsExcludeInclude
            ? translate().Settings.RegularOptions.Attachments.Included
                .Placeholder
            : translate().Settings.RegularOptions.Attachments.Excluded
                .Placeholder,
        );
        text.inputEl.rows = 3;
        text.inputEl.cols = 30;
      });

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.IgnoredFrontmatter.Label)
      .setDesc(
        translate().Settings.RegularOptions.IgnoredFrontmatter.Description,
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.ignoredFrontmatter.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.ignoredFrontmatter = value
              .split(",")
              .map((ext) => ext.trim())
              .filter((ext) => ext.length > 1 && ext !== "");

            this.plugin.saveSettings();
          });
        text.setPlaceholder(
          translate().Settings.RegularOptions.IgnoredFrontmatter.Placeholder,
        );
        text.inputEl.rows = 4;
        text.inputEl.cols = 30;
      });

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.PreviewDeletedFiles.Label)
      .setDesc(
        translate().Settings.RegularOptions.PreviewDeletedFiles.Description,
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.deletionConfirmation);

        toggle.onChange((value) => {
          this.plugin.settings.deletionConfirmation = value;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.RemoveFolders.Label)
      .setDesc(translate().Settings.RegularOptions.RemoveFolders.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.removeFolders);

        toggle.onChange((value) => {
          this.plugin.settings.removeFolders = value;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.RunOnStartup.Label)
      .setDesc(translate().Settings.RegularOptions.RunOnStartup.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.runOnStartup);

        toggle.onChange((value) => {
          this.plugin.settings.runOnStartup = value;
          this.plugin.saveSettings();
        });
      });
    //#endregion Regular Options }}}

    //#region Danger Zone {{{
    this.containerEl.createEl("h3", {
      text: translate().Settings.DangerZone.Header,
    });

    new Setting(containerEl)
      .setName(translate().Settings.DangerZone.ResetSettings.Label)
      .setDesc(translate().Settings.DangerZone.ResetSettings.Description)
      .addButton((button) => {
        button
          .setWarning()
          .setButtonText(translate().Settings.DangerZone.ResetSettings.Button)
          .onClick(() => {
            ResetSettingsModal({
              app: this.app,
              onConfirm: () => {
                this.plugin.settings = DEFAULT_SETTINGS;
                this.plugin.saveSettings();
                this.display();
                this.plugin.loadSettings();

                new Notice(translate().Notifications.SettingsReset);
              },
            });
          });
      });
    //#endregion Danger Zone }}}
  }
}
