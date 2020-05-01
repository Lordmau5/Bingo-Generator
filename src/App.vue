<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-row style="height: 100%">
        <v-col cols="12" align-self="start">
          <v-list dense>
            <v-list-item link exact :to="{ name: 'Generator' }">
              <v-list-item-action>
                <v-icon>mdi-rotate-right</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Generator</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item link exact :to="{ name: 'Editor' }">
              <v-list-item-action>
                <v-icon>mdi-file-document-edit</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Editor</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12" align-self="end">
          <v-list dense>
            <v-list-item link @click="reset_dialog = true">
              <v-list-item-action>
                <v-icon>mdi-redo</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  Reset
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item link @click="importGames">
              <v-list-item-action>
                <v-icon>mdi-upload</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  Import
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item link @click="exportGames">
              <v-list-item-action>
                <v-icon>mdi-download</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Export</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-avatar class="mr-2">
        <v-img src="@/assets/yakuza_kiwami.png"></v-img>
      </v-avatar>
      <v-toolbar-title>Bingo Generator</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-content>

    <v-dialog v-model="reset_dialog" max-width="500">
      <v-card>
        <v-card-title>Reset Games In Editor</v-card-title>
        <v-card-text>
          Do you really want to reset the games in the editor? This will make sure you are getting
          the newest file from the server again.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            text
            @click="
              reset_dialog = false;
              resetGames();
            "
          >
            Okay
          </v-btn>
          <v-btn color="red darken-1" text @click="reset_dialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-file-input
      id="file-input"
      accept="application/json"
      label="Import"
      style="display: none;"
      @change="onImportGames"
    ></v-file-input>
  </v-app>
</template>

<script>
import original_games from "./assets/games.json";

export default {
  data: () => ({
    drawer: null,
    reset_dialog: false
  }),
  created() {
    this.$vuetify.theme.dark = true;
  },
  methods: {
    resetGames() {
      localStorage.setItem("games_list", JSON.stringify(original_games));
    },
    exportGames() {
      const downloadLink = document.createElement("a");
      const url = URL.createObjectURL(
        new Blob([localStorage.getItem("games_list")], { type: "application/json" })
      );
      downloadLink.href = url;
      downloadLink.download = "games.json";
      downloadLink.click();
    },
    importGames() {
      document.getElementById("file-input").click();
    },
    onImportGames(file) {
      const reader = new FileReader();
      reader.onload = e => {
        const parsed = JSON.parse(e.currentTarget.result);
        const stringified = JSON.stringify(parsed);
        localStorage.setItem("games_list", stringified);
      };
      reader.readAsText(file, "application/json");
    }
  }
};
</script>
