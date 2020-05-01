<template>
  <div class="d-flex flex-column mb-6">
    <v-card>
      <v-card-text>
        <v-row align="center" justify="center">
          <v-col cols="12" class="py-0 my-0">
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
          <v-col cols="12" class="py-0 my-0">
            <v-expansion-panels v-model="settings_panel">
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Settings
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-layout row wrap align-start justify-start>
                    <v-flex xs12 lg4>
                      <v-row>
                        <v-col class="py-0 my-0">
                          <v-checkbox
                            class="py-0 my-0"
                            v-model="checkbox_easy"
                            label="Easy"
                            :color="getDifficultyColor('Easy')"
                            v-on:change="onCheckboxEasy"
                          ></v-checkbox>
                          <v-checkbox
                            class="py-0 my-0"
                            v-model="checkbox_normal"
                            label="Normal"
                            :color="getDifficultyColor('Normal')"
                            v-on:change="onCheckboxNormal"
                          ></v-checkbox>
                          <v-checkbox
                            class="py-0 my-0"
                            v-model="checkbox_hard"
                            label="Hard"
                            :color="getDifficultyColor('Hard')"
                            v-on:change="onCheckboxHard"
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-flex>
                    <v-flex xs12 lg4>
                      <v-row>
                        <v-col class="py-0 my-0">
                          <v-radio-group class="py-0 my-0" v-model="settings.freebie">
                            <v-radio :value="0" label="Freebie: Off" color="blue"></v-radio>
                            <v-radio :value="1" label="Freebie: Center" color="blue"></v-radio>
                            <v-radio :value="2" label="Freebie: Random" color="blue"></v-radio>
                          </v-radio-group>
                        </v-col>
                      </v-row>
                    </v-flex>
                    <v-flex xs12 lg4>
                      <v-row>
                        <v-col class="py-0 my-0">
                          <v-checkbox
                            class="py-0 my-0"
                            v-model="settings.unique_categories"
                            label="Unique Categories"
                            color="purple"
                          ></v-checkbox>
                          <v-checkbox
                            class="py-0 my-0"
                            v-model="settings.unique_groups"
                            label="Unique Groups"
                            color="purple"
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-flex>
                  </v-layout>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card style="height: 500px" class="overflow-y-auto">
      <v-card-text class="py-0 my-0">
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
    </v-card>
    <v-card>
      <v-card-actions>
        <v-btn @click="clickGenerate" :disabled="this.enabled.length < 25">Generate</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title class="headline">Generated Bingo Objectives!</v-card-title>

        <v-card-text>
          <code style="filter: blur(4px);">{{ generated_text }}</code>
          <div>
            <span><strong>Generated after:</strong> {{ generated_after }} attempts</span>
          </div>
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
    search: "",
    settings: {
      freebie: 0,
      unique_categories: false,
      unique_groups: false
    },
    checkbox_easy: false,
    checkbox_normal: false,
    checkbox_hard: false,
    dialog: false,
    generated_text: "",
    generated_after: 0,
    clipboard_snackbar: false,
    settings_panel: false
  }),
  watch: {
    settings: {
      deep: true,
      handler() {
        localStorage.setItem("generator_settings", JSON.stringify(this.settings));
      }
    }
  },
  methods: {
    clickGenerate() {
      const shuffled = _.shuffle(this.enabled);

      const objectives = [];

      const category_size = _.uniq(_.map(this.enabled, id => this.idToObjective[id].category))
        .length;
      const group_size = _.uniq(_.map(this.enabled, id => this.idToObjective[id].group)).length;

      let groups = [];
      let categories = [];
      let attempts = 0;
      let shuffleID = 0;
      while (objectives.length < 25 && attempts < 5000) {
        const obj = this.idToObjective[shuffled[shuffleID]];

        if (categories.length === category_size) {
          categories = [];
        }

        if (!categories.includes(obj.category)) {
          if (groups.length === group_size) {
            groups = [];
          }

          if (!groups.includes(obj.group)) {
            objectives.push({
              name: obj.title
            });
          }

          if (this.settings.unique_groups) {
            groups.push(obj.group);
          }
        }
        if (this.settings.unique_categories) {
          categories.push(obj.category);
        }

        if (++shuffleID >= shuffled.length) {
          shuffleID = 0;
        }
        attempts++;
      }

      // Center Freebie
      if (this.settings.freebie === 1) {
        objectives[12].name = "FREE";
      }
      // Random Freebie
      else if (this.settings.freebie === 2) {
        objectives[Math.floor(Math.random() * 25)].name = "FREE";
      }

      this.generated_text = JSON.stringify(objectives);
      this.generated_after = attempts;
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
    // Load settings
    const lsSettings = localStorage.getItem("generator_settings");
    if (lsSettings) {
      try {
        this.settings = JSON.parse(lsSettings);
      } catch {
        // Nothing
      }
    }

    // Load games
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
            this.idToObjective[id] = {
              title: option.title,
              group: group.group_name,
              category: category.category_name
            };

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
