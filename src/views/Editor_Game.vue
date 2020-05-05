<template>
  <div v-if="edit_game">
    <v-row>
      <v-col cols="12">
        <div>
          <span class="title">Game Name</span>
        </div>
        <v-text-field label="Game Name" v-model="input_game_name"></v-text-field>
        <v-btn class="ma-2" color="green" :disabled="!is_different_name" @click="updateGameName"
          >Update</v-btn
        >
      </v-col>

      <v-col cols="12">
        <div>
          <span class="title">Icon</span>
        </div>
        <v-list-item-avatar tile size="120">
          <v-img :src="edit_game.icon"></v-img>
        </v-list-item-avatar>
        <v-text-field label="Icon URL" v-model="input_icon_url"></v-text-field>
        <v-btn class="ma-2" color="green" @click="updateIconURL">Update</v-btn>
      </v-col>

      <v-col cols="12">
        <div v-show="!add_category && !edit_category">
          <v-select
            :label="`Categories (${edit_game.categories ? edit_game.categories.length : 0})`"
            :items="edit_game.categories"
            item-text="category_name"
            @input="setCategory"
            :disabled="is_adding || is_editing"
          >
          </v-select>
          <v-btn
            class="ma-2"
            color="green"
            @click="
              add_category = true;
              is_adding = true;
            "
            :disabled="is_adding || is_editing"
          >
            Add
          </v-btn>
          <v-btn
            class="ma-2"
            color="orange"
            @click="
              edit_category = true;
              is_editing = true;
              input_category = current_category.category_name;
            "
            :disabled="!current_category || is_adding || is_editing"
          >
            Edit
          </v-btn>
          <v-btn
            class="ma-2"
            color="red"
            @click="openDeleteDialog(1)"
            :disabled="!current_category || is_adding || is_editing"
          >
            Remove
          </v-btn>
        </div>

        <div v-show="add_category">
          <v-text-field label="Category Name" v-model="input_category"></v-text-field>
          <v-btn class="ma-2" color="green" @click="addCategory">Edit</v-btn>
          <v-btn
            class="ma-2"
            color="red"
            @click="
              add_category = false;
              is_adding = false;
            "
          >
            Cancel
          </v-btn>
        </div>

        <div v-show="edit_category && current_category">
          <v-text-field label="Category Name" v-model="input_category"></v-text-field>
          <v-btn class="ma-2" color="green" @click="editCategory">Edit</v-btn>
          <v-btn
            class="ma-2"
            color="red"
            @click="
              edit_category = false;
              is_editing = false;
            "
          >
            Cancel
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <div v-show="!add_group && !edit_group">
          <v-select
            :label="
              current_category
                ? `Groups (${current_category.groups ? current_category.groups.length : 0})`
                : 'Groups'
            "
            :items="current_category ? current_category.groups : []"
            item-text="group_name"
            @input="setGroup"
            :disabled="!current_category || is_adding || is_editing"
          >
          </v-select>
          <v-btn
            class="ma-2"
            color="green"
            @click="
              add_group = true;
              is_adding = true;
            "
            :disabled="!current_category || is_adding || is_editing"
          >
            Add
          </v-btn>
          <v-btn
            class="ma-2"
            color="orange"
            @click="
              edit_group = true;
              is_editing = true;
              input_group = current_group.group_name;
            "
            :disabled="!current_group || is_adding || is_editing"
          >
            Edit
          </v-btn>
          <v-btn
            class="ma-2"
            color="red"
            @click="openDeleteDialog(2)"
            :disabled="!current_group || is_adding || is_editing"
          >
            Remove
          </v-btn>
        </div>

        <div v-show="add_group && current_category">
          <v-text-field label="Group Name" v-model="input_group"></v-text-field>
          <v-btn class="ma-2" color="green" @click="addGroup">Add</v-btn>
          <v-btn
            class="ma-2"
            color="red"
            @click="
              add_group = false;
              is_adding = false;
            "
          >
            Cancel
          </v-btn>
        </div>

        <div v-show="edit_group && current_group">
          <v-text-field label="Group Name" v-model="input_group"></v-text-field>
          <v-btn class="ma-2" color="green" @click="editGroup">Edit</v-btn>
          <v-btn
            class="ma-2"
            color="red"
            @click="
              edit_group = false;
              is_editing = false;
            "
          >
            Cancel
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <div v-show="!add_option && !edit_option">
          <v-select
            :label="
              current_group
                ? `Options (${current_group.options ? current_group.options.length : 0})`
                : 'Options'
            "
            :items="current_group ? current_group.options : []"
            :item-text="item => `(${item.difficulty}) ${item.title}`"
            item-value="title"
            @input="setOption"
            :disabled="!current_group || is_adding || is_editing"
          >
            <template v-slot:item="{ item }">
              <v-chip class="mr-2" small :color="getDifficultyColor(item.difficulty)">
                <span>{{ item.difficulty }}</span>
              </v-chip>
              <span>{{ item.title }}</span>
            </template>
            <template v-slot:selection="{ item }">
              <v-chip class="mr-2" small :color="getDifficultyColor(item.difficulty)">
                <span>{{ item.difficulty }}</span>
              </v-chip>
              <span>{{ item.title }}</span>
            </template>
          </v-select>
          <v-btn
            class="ma-2"
            color="green"
            @click="
              add_option = true;
              is_adding = true;
            "
            :disabled="!current_group || is_adding || is_editing"
          >
            Add
          </v-btn>
          <v-btn
            class="ma-2"
            color="orange"
            @click="
              edit_option = true;
              is_editing = true;
              input_option = current_option.title;
              input_option_difficulty = current_option.difficulty;
            "
            :disabled="!current_option || is_adding || is_editing"
          >
            Edit
          </v-btn>
          <v-btn
            class="ma-2"
            color="red"
            @click="openDeleteDialog(3)"
            :disabled="!current_option || is_adding || is_editing"
          >
            Remove
          </v-btn>
        </div>

        <div v-show="add_option && current_group">
          <v-row>
            <v-col cols="6">
              <v-text-field label="Option Name" v-model="input_option"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                label="Difficulty"
                :items="['Easy', 'Normal', 'Hard']"
                v-model="input_option_difficulty"
              ></v-select>
            </v-col>
          </v-row>
          <v-btn class="ma-2" color="green" @click="addOption">Add</v-btn>
          <v-btn
            class="ma-2"
            color="red"
            @click="
              add_option = false;
              is_adding = false;
            "
          >
            Cancel
          </v-btn>
        </div>

        <div v-show="edit_option && current_option">
          <v-row>
            <v-col cols="6">
              <v-text-field label="Option Name" v-model="input_option"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                label="Difficulty"
                :items="['Easy', 'Normal', 'Hard']"
                v-model="input_option_difficulty"
              ></v-select>
            </v-col>
          </v-row>
          <v-btn class="ma-2" color="green" @click="editOption">Edit</v-btn>
          <v-btn
            class="ma-2"
            color="red"
            @click="
              edit_option = false;
              is_editing = false;
            "
          >
            Cancel
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="delete_dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Do you really want to delete this?</v-card-title>

        <v-card-text>
          Deletion is irreversible. Once it's gone, it's gone.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="delete_dialog = false">
            Disagree
          </v-btn>

          <v-btn color="green darken-1" text @click="handleDeleteDialog">
            Agree
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
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="error_dialog = false">
            Okay
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  data: () => ({
    id: -1,
    edit_game: false,
    games: [],

    delete_dialog: false,
    delete_choice: 0,

    error_dialog: false,
    error_message: "",

    current_category: false,
    current_group: false,
    current_option: false,

    is_editing: false,
    edit_category: false,
    edit_group: false,
    edit_option: false,

    input_icon_url: "",
    input_game_name: "",

    add_category: false,
    input_category: "",
    add_group: false,
    input_group: "",
    add_option: false,
    input_option: "",
    input_option_difficulty: "Easy",
    is_adding: false
  }),
  computed: {
    is_different_name() {
      if (!this.edit_game) {
        return false;
      }

      return this.edit_game.game_name !== this.input_game_name.trim();
    }
  },
  methods: {
    updateGames() {
      this.games[this.id] = this.edit_game;

      this.saveGamesList();
    },

    addCategory() {
      if (!this.edit_game.categories) {
        this.edit_game.categories = [];
      }

      if (
        this.input_category === "" ||
        this.edit_game.categories.some(
          c => c.category_name.toLowerCase() === this.input_category.toLowerCase()
        )
      ) {
        return;
      }

      this.edit_game.categories.push({
        category_name: this.input_category,
        groups: []
      });

      this.add_category = false;
      this.is_adding = false;

      this.updateGames();
    },
    editCategory() {
      if (
        this.current_category.category_name !== this.input_category &&
        (this.input_category === "" ||
          this.edit_game.categories.some(
            c => c.category_name.toLowerCase() === this.input_category.toLowerCase()
          ))
      ) {
        this.error_dialog = true;
        this.error_message = "A category with that name already exists!";
        return;
      }
      this.current_category.category_name = this.input_category;

      this.edit_category = false;
      this.is_editing = false;

      this.updateGames();
    },

    addGroup() {
      if (!this.current_category.groups) {
        this.current_category.groups = [];
      }

      if (
        this.input_group === "" ||
        this.current_category.groups.some(
          g => g.group_name.toLowerCase() === this.input_group.toLowerCase()
        )
      ) {
        return;
      }

      this.current_category.groups.push({
        group_name: this.input_group,
        options: []
      });

      this.add_group = false;
      this.is_adding = false;

      this.updateGames();
    },
    editGroup() {
      if (
        this.current_group.group_name !== this.input_group &&
        (this.input_group === "" ||
          this.current_category.groups.some(
            g => g.group_name.toLowerCase() === this.input_group.toLowerCase()
          ))
      ) {
        return;
      }
      this.current_group.group_name = this.input_group;

      this.edit_group = false;
      this.is_editing = false;

      this.updateGames();
    },

    addOption() {
      if (!this.current_group.options) {
        this.current_group.options = [];
      }

      if (
        this.input_option === "" ||
        this.current_group.options.some(
          o => o.title.toLowerCase() === this.input_option.toLowerCase()
        ) ||
        !["Easy", "Normal", "Hard"].includes(this.input_option_difficulty)
      ) {
        return;
      }

      this.current_group.options.push({
        title: this.input_option,
        difficulty: this.input_option_difficulty
      });

      this.add_option = false;
      this.is_adding = false;

      this.updateGames();
    },
    editOption() {
      if (
        this.current_option.title !== this.input_option &&
        (this.input_option === "" ||
          this.current_group.options.some(
            o => o.title.toLowerCase() === this.input_option.toLowerCase()
          ))
      ) {
        return;
      }
      this.current_option.title = this.input_option;
      this.current_option.difficulty = this.input_option_difficulty;

      this.edit_option = false;
      this.is_editing = false;

      this.updateGames();
    },

    setCategory(value) {
      this.current_category = this.edit_game.categories.find(c => c.category_name === value);
      this.current_group = false;
      this.current_option = false;
    },
    setGroup(value) {
      this.current_group = this.current_category.groups.find(g => g.group_name === value);
      this.current_option = false;
    },
    setOption(value) {
      this.current_option = this.current_group.options.find(o => o.title === value);
    },

    openDeleteDialog(choice) {
      this.delete_choice = choice;
      this.delete_dialog = true;
    },
    handleDeleteDialog() {
      if (this.delete_choice === 1) {
        this.deleteCategory();
      } else if (this.delete_choice === 2) {
        this.deleteGroup();
      } else if (this.delete_choice === 3) {
        this.deleteOption();
      }

      this.delete_dialog = false;
    },

    deleteCategory() {
      this.edit_game.categories = this.edit_game.categories.filter(
        c => c.category_name !== this.current_category.category_name
      );
      this.current_category = false;
      this.current_group = false;
      this.current_option = false;

      this.updateGames();
    },
    deleteGroup() {
      this.current_category.groups = this.current_category.groups.filter(
        g => g.group_name !== this.current_group.group_name
      );
      this.current_group = false;
      this.current_option = false;

      this.updateGames();
    },
    deleteOption() {
      this.current_group.options = this.current_group.options.filter(
        o => o.title !== this.current_option.title
      );
      this.current_option = false;

      this.updateGames();
    },

    getDifficultyColor(difficulty) {
      if (difficulty === "Easy") return "green";
      if (difficulty === "Normal") return "orange";
      if (difficulty === "Hard") return "red";

      return "grey";
    },

    async loadGamesList() {
      // Load from Server
      const games_request = await fetch("/games.json");
      if (games_request) {
        const games_json = await games_request.json();

        this.loading_games = games_json;

        for (let i = 0; i < games_json.length; i++) {
          this.games.push({ game_name: games_json[i] });
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
      }
    },

    saveGamesList() {
      localStorage.setItem("games_list", JSON.stringify(this.games));
    },

    findGameByName(name) {
      return this.games.find(g => g.game_name.toLowerCase().trim() === name.toLowerCase().trim());
    },

    updateIconURL() {
      this.edit_game.icon = this.input_icon_url.trim();

      this.updateGames();
    },

    updateGameName() {
      const name = this.input_game_name.trim();

      if (this.findGameByName(name)) {
        this.error_dialog = true;
        this.error_message = "A game with that name already exists!";
        return;
      }
      this.edit_game.game_name = name;

      this.updateGames();
    }
  },
  async mounted() {
    await this.loadGamesList();

    this.edit_game = _.find(
      this.games,
      g => g.game_name.toLowerCase() === this.$route.params.id.toLowerCase()
    );
    if (this.edit_game) {
      this.id = _.findIndex(
        this.games,
        g => g.game_name.toLowerCase() === this.$route.params.id.toLowerCase()
      );

      this.input_game_name = this.edit_game.game_name;
      this.input_icon_url = this.edit_game.icon;
    }
  }
};
</script>
