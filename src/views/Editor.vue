<template>
  <div>
    <v-container>
      <v-layout row wrap align-start justify-start>
        <v-flex xs12 class="mb-6">
          <v-card max-width="400" outlined>
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="headline mb-1">New Game</v-list-item-title>
                <v-list-item-subtitle>Add a new game</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-avatar tile size="80">
                <v-icon size="80">mdi-plus</v-icon>
              </v-list-item-avatar>
            </v-list-item>

            <v-card-actions>
              <v-btn text color="green" @click="new_game_dialog = true">Add</v-btn>
              <v-spacer></v-spacer>
              <v-btn text color="blue" @click="importGame">
                <v-icon left>mdi-upload</v-icon> Import
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
        <v-flex xs12 lg3 class="mb-2" v-for="(game, index) in games" :key="game.game_name">
          <v-card max-width="400" outlined>
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="headline mb-1">{{ game.game_name }}</v-list-item-title>
                <v-list-item-subtitle>{{ game.game_name }}</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-avatar tile size="80">
                <v-img :src="game.icon"></v-img>
              </v-list-item-avatar>
            </v-list-item>

            <v-card-actions>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" icon tile color="green" @click="editGame(index)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" icon tile color="red" @click="deleteGameDialog(index)">
                    <v-icon>mdi-trash-can</v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
              <v-spacer></v-spacer>
              <v-btn text color="blue" @click="exportGame(index)">
                <v-icon left>mdi-download</v-icon> Export
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-dialog v-model="new_game_dialog" width="500">
      <v-card>
        <v-card-title class="headline" primary-title>
          Add New Game
        </v-card-title>

        <v-card-text>
          <v-text-field label="Game Name" v-model="new_game_name"></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="green" text :disabled="!is_valid_game_name" @click="addGame()">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="delete_game_dialog" width="500">
      <v-card>
        <v-card-title class="headline" primary-title>
          Delete {{ delete_game && delete_game.game_name }}?
        </v-card-title>

        <v-card-text>
          Are you sure you want to delete {{ delete_game && delete_game.game_name }} forever?<br />
          <strong>This action is irreversible.</strong>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="blue" text @click="delete_game_dialog = false">
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="deleteGame()">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="override_dialog" max-width="500">
      <v-card>
        <v-card-title class="headline" primary-title>
          Override {{ override_game && override_game.game_name }}?
        </v-card-title>

        <v-card-text>
          Are you sure you want to override {{ override_game && override_game.game_name }}?<br />
          <strong>This action is irreversible.</strong>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="red" text @click="override_dialog = false">
            No
          </v-btn>
          <v-btn color="green" text @click="overrideGame()">
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="error_dialog" max-width="500">
      <v-card>
        <v-card-title>{{ error_message }}</v-card-title>
        <v-card-text>
          <v-img src="@/assets/no.gif"></v-img>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green" text @click="error_dialog = false">
            Okay
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-file-input
      id="file-input"
      accept="application/json"
      label="Import"
      style="display: none;"
      @change="onImportGame"
    ></v-file-input>
  </div>
</template>

<script>
import _ from "lodash";
import original_games from "../assets/games.json";

export default {
  data: () => ({
    games: [],
    new_game_dialog: false,
    delete_game_dialog: false,

    override_dialog: false,
    override_game: false,

    error_dialog: false,
    error_message: "",

    new_game_name: "",
    delete_game_id: -1
  }),
  computed: {
    is_valid_game_name() {
      return (
        this.new_game_name.toLowerCase().trim() !== "" && !this.findGameByName(this.new_game_name)
      );
    },
    delete_game() {
      if (this.delete_game_id > -1 && this.delete_game_id < this.games.length) {
        return this.games[this.delete_game_id];
      }

      return false;
    }
  },
  methods: {
    generateGamesList() {
      this.games = original_games;

      this.saveGamesList();
    },

    loadGamesList() {
      const games_list = localStorage.getItem("games_list");
      if (!games_list) {
        this.generateGamesList();
      } else {
        this.games = JSON.parse(games_list);
      }

      if (this.games.length === 0 || !this.games[0].game_name || !this.games[0].categories) {
        this.generateGamesList();
      }
    },

    saveGamesList() {
      localStorage.setItem("games_list", JSON.stringify(this.games));
    },

    editGame(id) {
      this.$router.push({ name: "EditorGame", params: { id } });
    },

    deleteGameDialog(id) {
      this.delete_game_id = id;
      this.delete_game_dialog = true;
    },

    deleteGame() {
      this.delete_game_dialog = false;
      this.games.splice(this.delete_game_id, 1);
      this.saveGamesList();
    },

    addGame() {
      this.games.push({
        game_name: this.new_game_name.trim(),
        icon: ""
      });

      this.saveGamesList();

      this.$router.push({ name: "EditorGame", params: { id: this.games.length - 1 } });
    },

    exportGame(id) {
      const game = this.games[id];

      const downloadLink = document.createElement("a");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(game)], { type: "application/json" })
      );
      downloadLink.href = url;
      downloadLink.download = `${game.game_name}.json`;
      downloadLink.click();
    },

    importGame() {
      document.getElementById("file-input").click();
    },
    onImportGame(file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.currentTarget.result);

          if (!parsed.game_name) {
            this.error_dialog = true;
            this.error_message = "The game to import is invalid.";
            return;
          }

          if (this.findGameByName(parsed.game_name)) {
            this.override_dialog = true;
            this.override_game = parsed;
            return;
          }

          this.games.push(parsed);
          this.saveGamesList();
        } catch (error) {
          this.error_dialog = true;
          this.error_message = "There was an error loading the JSON file.";
        }
      };
      reader.readAsText(file, "application/json");
    },

    overrideGame() {
      const index = _.findIndex(
        this.games,
        g => g.game_name.toLowerCase().trim() === this.override_game.game_name.toLowerCase().trim()
      );

      if (index === -1) {
        this.override_dialog = false;
        this.override_game = false;
        return;
      }

      this.games[index] = this.override_game;
      this.override_dialog = false;
      this.override_game = false;

      this.saveGamesList();
    },

    findGameByName(name) {
      return this.games.find(g => g.game_name.toLowerCase().trim() === name.toLowerCase().trim());
    }
  },
  mounted() {
    this.loadGamesList();
  }
};
</script>
