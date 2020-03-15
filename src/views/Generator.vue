<template>
  <div class="d-flex flex-column mb-6">
    <v-card>
      <v-card-text style="height: 700px" class="overflow-y-auto">
        <v-row align="center" justify="center">
          <v-col cols="6">
            <v-text-field
              v-model="search"
              label="Search Objectives"
              dark
              flat
              solo-inverted
              hide-details
              clearable
              clear-icon="mdi-close-circle-outline"
            >
            </v-text-field>
          </v-col>
          <v-col cols="6">
            <v-row>
              <v-col>
                <v-checkbox
                  v-model="checkbox_easy"
                  label="Easy"
                  :color="getDifficultyColor('Easy')"
                  v-on:change="onCheckboxEasy"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="checkbox_normal"
                  label="Normal"
                  :color="getDifficultyColor('Normal')"
                  v-on:change="onCheckboxNormal"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="checkbox_hard"
                  label="Hard"
                  :color="getDifficultyColor('Hard')"
                  v-on:change="onCheckboxHard"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-treeview
          :items="items"
          :search="search"
          :value="enabled"
          dense
          selectable
          hoverable
          shaped
          rounded
          open-on-click
          @input="onTreeviewUpdate"
        >
          <template v-slot:label="{ item }">
            <v-chip
              v-if="item.difficulty"
              class="mr-2"
              small
              :color="getDifficultyColor(item.difficulty)"
            >
              <span>{{ item.difficulty }}</span>
            </v-chip>
            <span>{{ item.name }}</span>
          </template>
        </v-treeview>
      </v-card-text>

      <v-card-actions>
        <v-btn @click="clickGenerate" :disabled="this.enabled.length < 25">Generate</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title class="headline">Generated Bingo Objectives!</v-card-title>

        <v-card-text>
          <code>{{ generated_text }}</code>
        </v-card-text>

        <v-card-actions>
          <v-btn color="green darken-1" text @click="copyGenerated">
            Copy
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="clipboard_snackbar" :timeout="3000">
      <v-container>
        <v-img src="@/assets/copied.gif"></v-img>
      </v-container>
    </v-snackbar>
  </div>
</template>

<script>
import _ from "lodash";
import clipboard from "copy-to-clipboard";

import games from "../assets/games.json";

export default {
  data: () => ({
    items: [],
    idToObjective: {},
    enabled: [],
    search: null,
    checkbox_easy: false,
    checkbox_normal: false,
    checkbox_hard: false,
    dialog: false,
    generated_text: "",
    clipboard_snackbar: false
  }),
  methods: {
    clickGenerate() {
      const shuffled = _.take(_.shuffle(this.enabled), 25);

      const objectives = [];
      shuffled.forEach(id => {
        objectives.push({
          name: this.idToObjective[id]
        });
      });

      this.generated_text = JSON.stringify(objectives);
      this.dialog = true;
    },
    copyGenerated() {
      clipboard(this.generated_text);
      this.clipboard_snackbar = true;
      this.dialog = false;
    },

    onTreeviewUpdate(items) {
      this.enabled = items;
      this.updateFilterCheckboxes();
    },

    getDifficultyColor(difficulty) {
      if (difficulty === "Easy") return "green";
      if (difficulty === "Normal") return "orange";
      if (difficulty === "Hard") return "red";

      return "grey";
    },

    checkEvery(difficulty) {
      let returnv = true;
      this.items.forEach(game =>
        game.children.forEach(category =>
          category.children.forEach(group =>
            group.children.forEach(option => {
              if (option.difficulty === difficulty && !this.enabled.includes(option.id)) {
                returnv = false;
              }
            })
          )
        )
      );
      return returnv;
    },
    updateFilterCheckboxes() {
      this.checkbox_easy = this.checkEvery("Easy");
      this.checkbox_normal = this.checkEvery("Normal");
      this.checkbox_hard = this.checkEvery("Hard");
    },

    enableDisableDifficulty(difficulty, state) {
      this.items.forEach(game =>
        game.children.forEach(category =>
          category.children.forEach(group =>
            group.children.forEach(option => {
              if (option.difficulty === difficulty) {
                if (!state) {
                  this.enabled = this.enabled.filter(id => id !== option.id);
                } else if (!this.enabled.includes(option.id)) {
                  this.enabled.push(option.id);
                }
              }
            })
          )
        )
      );
    },
    onCheckboxEasy() {
      this.enableDisableDifficulty("Easy", this.checkbox_easy);
    },
    onCheckboxNormal() {
      this.enableDisableDifficulty("Normal", this.checkbox_normal);
    },
    onCheckboxHard() {
      this.enableDisableDifficulty("Hard", this.checkbox_hard);
    }
  },
  mounted() {
    this.items = [];
    let id = 0;

    let lsGames = localStorage.getItem("games_list");
    if (lsGames) {
      try {
        lsGames = JSON.parse(lsGames);
      } catch {
        lsGames = false;
      }
    }

    if (!lsGames) {
      lsGames = games;
    }

    lsGames.forEach(game => {
      const game_o = {
        id: id++,
        name: game.game_name,
        children: []
      };

      game.categories.forEach(category => {
        const category_o = {
          id: id++,
          name: category.category_name,
          children: []
        };

        category.groups.forEach(group => {
          const group_o = {
            id: id++,
            name: group.group_name,
            children: []
          };

          group.options.forEach(option => {
            this.idToObjective[id] = option.title;

            const option_o = {
              id: id++,
              name: option.title,
              difficulty: option.difficulty
            };

            group_o.children.push(option_o);
          });

          category_o.children.push(group_o);
        });

        game_o.children.push(category_o);
      });

      this.items.push(game_o);
    });
  }
};
</script>
