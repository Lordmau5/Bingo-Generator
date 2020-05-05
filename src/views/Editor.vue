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
        <v-flex xs12 lg3 class="mb-2" v-for="game in loading_games" :key="game">
          <v-card max-width="400" outlined>
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="headline mb-1">{{ game }}</v-list-item-title>
                <v-list-item-subtitle>{{ game }}</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-avatar tile size="80">
                <v-skeleton-loader type="image" width="80"></v-skeleton-loader>
              </v-list-item-avatar>
            </v-list-item>

            <v-card-actions>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" icon tile color="red">
                    <v-icon>mdi-lock</v-icon>
                  </v-btn>
                </template>
                <span>Locked</span>
              </v-tooltip>
            </v-card-actions>
          </v-card>
        </v-flex>
        <v-flex xs12 lg3 class="mb-2" v-for="game in games" :key="game.game_name">
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
              <template v-if="game.locked">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" icon tile color="red" disabled>
                      <v-icon>mdi-lock</v-icon>
                    </v-btn>
                  </template>
                  <span>Locked</span>
                </v-tooltip>
              </template>
              <template v-else>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      tile
                      color="green"
                      @click="editGame(game.game_name)"
                      :disabled="game.locked"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      tile
                      color="red"
                      @click="deleteGameDialog(game.game_name)"
                      :disabled="game.locked"
                    >
                      <v-icon>mdi-trash-can</v-icon>
                    </v-btn>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
                <v-spacer></v-spacer>
                <v-btn text color="blue" @click="exportGame(game.game_name)">
                  <v-icon left>mdi-download</v-icon> Export
                </v-btn>
              </template>
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

export default {
  data: () => ({
    games: [],
    loading_games: [],
    new_game_dialog: false,
    delete_game_dialog: false,

    override_dialog: false,
    override_game: false,

    error_dialog: false,
    error_message: "",

    new_game_name: "",
    delete_game_name: ""
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
    async loadGamesList() {
      // Load from Server
      const games_request = await fetch("/games.json");
      if (games_request) {
        const games_json = await games_request.json();

        this.loading_games = games_json;

        const requests = [];
        for (let i = 0; i < games_json.length; i++) {
          requests.push(fetch(`/games/${games_json[i]}.json`).then(b => b.json()));
        }

        const games = await Promise.all(requests);
        for (let i = 0; i < games.length; i++) {
          this.loading_games = _.filter(this.loading_games, e => e !== games[i].game_name);
          this.games.push({ locked: true, ...games[i] });
        }
      }

      const games_list = localStorage.getItem("games_list");
      if (!games_list) {
        localStorage.setItem("games_list", JSON.stringify([]));
      } else {
        const games = _.filter(
          JSON.parse(games_list),
          g => !_.some(this.games, _g => g.game_name.toLowerCase() === _g.game_name.toLowerCase())
        );
        _.forEach(games, g => this.games.push(g));
        this.saveGamesList();
      }
    },

    saveGamesList() {
      localStorage.setItem("games_list", JSON.stringify(_.filter(this.games, g => !g.locked)));
      console.log(localStorage.getItem("games_list"));
    },

    editGame(id) {
      this.$router.push({ name: "EditorGame", params: { id } });
    },

    deleteGameDialog(name) {
      this.delete_game_name = name;
      this.delete_game_dialog = true;
    },

    deleteGame() {
      this.delete_game_dialog = false;
      this.games = _.filter(
        this.games,
        g => g.game_name.toLowerCase() !== this.delete_game_name.toLowerCase()
      );
      this.saveGamesList();
    },

    addGame() {
      const name = this.new_game_name.trim();
      this.games.push({
        game_name: name,
        icon: ""
      });

      this.saveGamesList();

      this.$router.push({ name: "EditorGame", params: { id: name } });
    },

    exportGame(name) {
      const game = _.find(this.games, g => g.game_name.toLowerCase() === name.toLowerCase());

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

          const override_game = this.findGameByName(parsed.game_name);
          if (override_game) {
            if (override_game.locked) {
              this.error_dialog = true;
              this.error_message = "The game you are trying to override is locked.";
              return;
            }

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
