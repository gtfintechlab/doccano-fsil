<template>
  <layout-text v-if="doc.id" v-shortkey="shortKeys" @shortkey="changeSelectedLabel">
    <template #header>
        <div v-if="isProjectAdmin">
            <v-container class="maxwidth">
            <v-tooltip color="black" top>
                <template v-slot:activator="{ on, attrs }">
                <div
                    v-bind="attrs"
                    v-on="on"
                    style="width:min-content;"
                >
                    
                <v-switch 
                v-model="toggleDev"
                :prepend-icon = "mdiAccountCogOutline"     
                color = "deep-orange"  
                >
                    </v-switch>
                </div>
                </template>
                <div>
                Display Additional Statistics
                </div>
            </v-tooltip>
            </v-container>
        </div>
        
      <toolbar-laptop
        :doc-id="doc.id"
        :enable-auto-labeling.sync="enableAutoLabeling"
        :guideline-text="project.guideline"
        :is-reviewd="doc.isConfirmed"
        :total="docs.count"
        :example = "doc"
        :proj-id = "project.id"
        :timeanot = "AnotDict[doc.id]"
        class="d-none d-sm-block"
        @click:clear-label="clear"
        @click:review="confirm"
        @messageFromChild = "messagetoollap"
      />
      <toolbar-mobile :total="docs.count" class="d-flex d-sm-none" />
    </template>
    <template #content>
      <v-card>
        <div class="annotation-text pa-4">
          <entity-editor
            :dark="$vuetify.theme.dark"
            :rtl="isRTL"
            :text="doc.text"
            :entities="annotations"
            :entity-labels="spanTypes"
            :relations="relations"
            :relation-labels="relationTypes"
            :allow-overlapping="project.allowOverlappingSpans"
            :grapheme-mode="project.enableGraphemeMode"
            :selected-label="selectedLabel"
            :relation-mode="relationMode"
            :toggle-dev = "toggleDev"
            @addEntity="addSpan"
            @addRelation="addRelation"
            @click:entity="updateSpan"
            @click:relation="updateRelation"
            @contextmenu:entity="deleteSpan"
            @contextmenu:relation="deleteRelation"
          />
        </div>
      </v-card>
      <v-card v-if="toggleDev" :class="{'additional-statistics': true, 
      'light-theme': !$vuetify.theme.dark, 'dark-theme': $vuetify.theme.dark}">
            <div class="statistics-header">
                <h3 class="statistics-title">Additional Statistics</h3>
            </div>
                <div class="statistics-items">
                    <div class="statistics-item">
                        <span class="statistics-label">Elapsed Time</span>
                        <div class="statistics-text">{{ formatTime(AnotDict[doc.id]) }}</div>
                    </div>
                    <!-- <div class="statistics-item">
                        <span class="statistics-label">Confidence</span>
                        <div :class="{
                            'changed-true': doc.confidence,
                            'changed-false': !doc.confidence
                        }">
                        {{ renderChangedStatus(doc.confidence) }}
                        </div>
                    </div> -->
                    <!-- <div class="statistics-item">
                        <div class="statistics-item">
                            <span class="statistics-label">Assignment Changed</span>
                            <div class="statistics-text" :class="{
                                'changed-true': doc.changed,
                                'changed-false': !doc.changed
                            }">{{ renderChangedStatus(doc.changed) }}
                            </div>
                        </div>
                    </div> -->
                </div>
    </v-card>
    </template>
    <template #sidebar>
      <annotation-progress :progress="progress" />
      <v-card class="mt-4">
        <v-card-title>
          Label Types
          <v-spacer />
          <v-btn icon @click="showLabelTypes = !showLabelTypes">
            <v-icon>{{ showLabelTypes ? mdiChevronUp : mdiChevronDown }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-expand-transition>
          <v-card-text v-show="showLabelTypes">
            <v-switch v-if="useRelationLabeling" v-model="relationMode">
              <template #label>
                <span v-if="relationMode">Relation</span>
                <span v-else>Span</span>
              </template>
            </v-switch>
            <v-chip-group v-model="selectedLabelIndex" column>
              <v-chip
                v-for="(item, index) in labelTypes"
                :key="item.id"
                v-shortkey="[item.suffixKey]"
                :color="item.backgroundColor"
                filter
                :text-color="$contrastColor(item.backgroundColor)"
                @shortkey="selectedLabelIndex = index"
              >
                {{ item.text }}
                <v-avatar
                  v-if="item.suffixKey"
                  right
                  color="white"
                  class="black--text font-weight-bold"
                >
                  {{ item.suffixKey }}
                </v-avatar>
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-expand-transition>
      </v-card>
      <list-metadata :metadata="doc.meta" class="mt-4" />
    </template>
  </layout-text>
</template>

<script>
import { mdiChevronDown, mdiChevronUp,mdiAccountCogOutline} from '@mdi/js'
import _ from 'lodash'
import { mapGetters } from 'vuex'
// import { useFetch,useContext ,watch} from '@nuxtjs/composition-api'
import LayoutText from '@/components/tasks/layout/LayoutText'
import ListMetadata from '@/components/tasks/metadata/ListMetadata'
import EntityEditor from '@/components/tasks/sequenceLabeling/EntityEditor.vue'
import AnnotationProgress from '@/components/tasks/sidebar/AnnotationProgress.vue'
import ToolbarLaptop from '@/components/tasks/toolbar/ToolbarLaptop'
import ToolbarMobile from '@/components/tasks/toolbar/ToolbarMobile'
import { useExampleItem } from '~/composables/useExampleItem'

export default {
  components: {
    AnnotationProgress,
    EntityEditor,
    LayoutText,
    ListMetadata,
    ToolbarLaptop,
    ToolbarMobile
  },

  layout: 'workspace',

  validate({ params, query }) {
    console.log("params",params)
    console.log("query",query)
    return /^\d+$/.test(params.id) && /^\d+$/.test(query.page)
  },
  setup(){
    const {state: updateTime} = useExampleItem()
    return updateTime
  },
  data() {
    return {
      annotations: [],
      docs: [],
      spanTypes: [],
      relations: [],
      relationTypes: [],
      project: {},
      enableAutoLabeling: false,
      toggleDev : false,
      rtl: false,
      AnotDict : {},
      selectedLabelIndex: null,
      progress: {},
      relationMode: false,
      showLabelTypes: true,
      mdiChevronUp,
      mdiChevronDown,
      mdiAccountCogOutline,
    }
  },
  async fetch() {
    
    this.docs = await this.$services.example.fetchOne(
      this.projectId,
      this.$route.query.page,
      this.$route.query.q,
      this.$route.query.isChecked,
      this.$route.query.ordering
    )
    const doc = this.docs.items[0]
    console.log(doc.text.slice(0,5)," : ",doc.time_annotated)
    console.log("theme",this.$vuetify.theme.dark)
    // console.log("Empty Dict",this.AnotDict)
    // console.log(await this.fetchExampleById(doc.id))
    if (this.enableAutoLabeling && !doc.isConfirmed) {
      await this.autoLabel(doc.id)
    }
    await this.list(doc.id)
  },
  
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'getUsername', 'getUserId']),
    ...mapGetters('config', ['isRTL']),

    shortKeys() {
      return Object.fromEntries(this.spanTypes.map((item) => [item.id, [item.suffixKey]]))
    },

    projectId() {
      return this.$route.params.id
    },

    doc() {
      if (_.isEmpty(this.docs) || this.docs.items.length === 0) {
        return {}
      } else {
        return this.docs.items[0]
      }
    },

    selectedLabel() {
      if (Number.isInteger(this.selectedLabelIndex)) {
        if (this.relationMode) {
          return this.relationTypes[this.selectedLabelIndex]
        } else {
          return this.spanTypes[this.selectedLabelIndex]
        }
      } else {
        return null
      }
    },

    useRelationLabeling() {
      return !!this.project.useRelation
    },

    labelTypes() {
      if (this.relationMode) {
        return this.relationTypes
      } else {
        return this.spanTypes
      }
    }
  },

  watch: {
    '$route.query': '$fetch',
    async enableAutoLabeling(val) {
      if (val && !this.doc.isConfirmed) {
        await this.autoLabel(this.doc.id)
        await this.list(this.doc.id)
      }
    }
  },

  async created() {
    this.spanTypes = await this.$services.spanType.list(this.projectId)
    this.relationTypes = await this.$services.relationType.list(this.projectId)
    this.project = await this.$services.project.findById(this.projectId)
    this.progress = await this.$repositories.metrics.fetchMyProgress(this.projectId)    
    const member = await this.$repositories.member.fetchMyRole(this.projectId)
    this.isProjectAdmin = member.isProjectAdmin

  },

  mounted(){
    
    setInterval(this.updateElapsedTime, 1000);
    this.updateAll();
    },
    beforeUpdate(){
        this.updateAll();
    },
    updated(){
        this.updateAll();
    },
    unmounted(){
        this.updateAll();
    },
    async beforeDestroy(){
        await this.updateAll();
    },
  methods: {
    updateElapsedTime() {
    if(this.AnotDict[this.doc.id] !== undefined){
    this.$set(this.AnotDict,this.doc.id,1 + this.AnotDict[this.doc.id])
    }
    else{ 
    this.$set(this.AnotDict,this.doc.id,this.doc.time_annotated)
    }

    const elapsedSeconds = this.AnotDict[this.doc.id];

    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    this.elapsedSeconds = seconds;
    this.elapsedHours = hours;
    this.elapsedMinutes = minutes;
    this.elapsedTime = `${hours}h ${minutes}m ${seconds}s`;
    // this.printAnotDictValues()
    },
    async messagetoollap(timeanot,ex,projId){
        ex.time_annotated = timeanot
        console.log("New Time to assign : ",timeanot)
        
        
        await this.$services.example.update(projId,ex)
        console.log(await this.$services.example.fetchOne(
      this.projectId,
      this.$route.query.page,
      this.$route.query.q,
      this.$route.query.isChecked,
      this.$route.query.ordering
    ) )
    },
    async updateAll(){
        console.log("updating all called")
      for (const [exampleid, timeanot] of Object.entries(this.AnotDict)) {
        const ex = await this.$services.example.findById(this.projectId,exampleid);
        ex.time_annotated = timeanot;
        await this.$services.example.update(this.projectId,ex);
      }
    },
    printAnotDictValues() {
      for (const key in this.AnotDict) {
        if (Object.hasOwnProperty.call(this.AnotDict, key)) {
          const value = this.AnotDict[key];
          console.log(key,value);
        }
      }
    },
    async maybeFetchSpanTypes(annotations) {
      const labelIds = new Set(this.spanTypes.map((label) => label.id))
      if (annotations.some((item) => !labelIds.has(item.label))) {
        this.spanTypes = await this.$services.spanType.list(this.projectId)
      }
    },
    togglebutton(){
        toggleDev = !toggleDev
    },
    async list(docId) {
      const annotations = await this.$services.sequenceLabeling.list(this.projectId, docId)
      const relations = await this.$services.sequenceLabeling.listRelations(this.projectId, docId)
      // In colab mode, if someone add a new label and annotate data
      // with the label during your work, it occurs exception
      // because there is no corresponding label.
      await this.maybeFetchSpanTypes(annotations)
      this.annotations = annotations
      this.relations = relations
    },
    
    renderChangedStatus(value) {
      return value ? 'True' : 'False';
    },
    formatTime(seconds) {

        if (typeof seconds === 'undefined') {
        return this.formatTime(this.doc.time_annotated);
      }
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      let formattedTime = '';

      if (hours > 0) {
        formattedTime += `${hours}h `;
      }

      if (minutes > 0 || hours > 0) {
        formattedTime += `${minutes}m `;
      }

      formattedTime += `${remainingSeconds}s`;

      return formattedTime;
    },
    async deleteSpan(id) {
      await this.$services.sequenceLabeling.delete(this.projectId, this.doc.id, id)
      await this.list(this.doc.id)
    },

    async addSpan(startOffset, endOffset, labelId,changed = false) {
      await this.$services.sequenceLabeling.create(
        this.projectId,
        this.doc.id,
        labelId,
        startOffset,
        endOffset,
        changed
      )
      await this.list(this.doc.id)
    },

    async updateSpan(annotationId, labelId) {
      await this.$services.sequenceLabeling.changeLabel(
        this.projectId,
        this.doc.id,
        annotationId,
        labelId
      )
      await this.list(this.doc.id)
    },

    async addRelation(fromId, toId, typeId) {
      await this.$services.sequenceLabeling.createRelation(
        this.projectId,
        this.doc.id,
        fromId,
        toId,
        typeId
      )
      await this.list(this.doc.id)
    },

    async updateRelation(relationId, typeId) {
      await this.$services.sequenceLabeling.updateRelation(
        this.projectId,
        this.doc.id,
        relationId,
        typeId
      )
      await this.list(this.doc.id)
    },

    async deleteRelation(relationId) {
      await this.$services.sequenceLabeling.deleteRelation(this.projectId, this.doc.id, relationId)
      await this.list(this.doc.id)
    },

    async clear() {
      await this.$services.sequenceLabeling.clear(this.projectId, this.doc.id)
      await this.list(this.doc.id)
    },

    async autoLabel(docId) {
      try {
        await this.$services.sequenceLabeling.autoLabel(this.projectId, docId)
      } catch (e) {
        console.log(e.response.data.detail)
      }
    },

    async updateProgress() {
      this.progress = await this.$repositories.metrics.fetchMyProgress(this.projectId)
    },

    async confirm() {
      await this.$services.example.confirm(this.projectId, this.doc.id)
      await this.$fetch()
      console.log("confirm")
      this.updateProgress()
    },

    changeSelectedLabel(event) {
      this.selectedLabelIndex = this.spanTypes.findIndex((item) => item.suffixKey === event.srcKey)
    }
  }
}
</script>

<!-- For light theme -->
<style scoped>
.light-theme {
  /* Define styles for the light theme here */
  /* Example styles: */
  background-color: #ffffff;
  color: #333333;
}

.light-theme .annotation-text {
  font-size: 1.25rem !important;
  font-weight: 500;
  line-height: 2rem;
  font-family: 'Roboto', sans-serif !important;
  opacity: 0.6;
}

.light-theme .additional-statistics {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.light-theme .statistics-header {
  text-align: center;
  margin-bottom: 15px;
}

.light-theme .statistics-title {
  font-size: 1.75rem;
  margin-bottom: 10px;
}

.light-theme .statistics-items {
  display: flex;
  justify-content: space-evenly;
  align-items: stretch;
  min-height: max-content;
}

.light-theme .statistics-item {
  margin-bottom: 15px;
}

.light-theme .statistics-label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  font-size: 1.3rem;
}

.light-theme .statistics-text {
  font-size: 1.2rem;
}

.light-theme .changed-true {
  font-size: 1.2rem;
  color: green;
}

.light-theme .changed-false {
  font-size: 1.2rem;
  color: red;
}
</style>

<!-- For dark theme -->
<style scoped>
.dark-theme {
  /* Define styles for the dark theme here */
  /* Example styles: */
  background-color: #333333;
  color: #ffffff;
}

.dark-theme .annotation-text {
  font-size: 1.25rem !important;
  font-weight: 500;
  line-height: 2rem;
  font-family: 'Roboto', sans-serif !important;
  opacity: 0.6;
}

.dark-theme .additional-statistics {
  background-color: #424242;
  border: 1px solid #757575;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
}

.dark-theme .statistics-header {
  text-align: center;
  margin-bottom: 15px;
}

.dark-theme .statistics-title {
  font-size: 1.75rem;
  margin-bottom: 10px;
}

.dark-theme .statistics-items {
  display: flex;
  justify-content: space-evenly;
  align-items: stretch;
  min-height: max-content;
}

.dark-theme .statistics-item {
  margin-bottom: 15px;
}

.dark-theme .statistics-label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  font-size: 1.3rem;
}

.dark-theme .statistics-text {
  font-size: 1.2rem;
}

.dark-theme .changed-true {
  font-size: 1.2rem;
  color: #66BB6A;
}

.dark-theme .changed-false {
  font-size: 1.2rem;
  color: #EF5350;
}
</style>

<!-- <style scoped>
.annotation-text {
  font-size: 1.25rem !important;
  font-weight: 500;
  line-height: 2rem;
  font-family: 'Roboto', sans-serif !important;
  opacity: 0.6;
}
.additional-statistics {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
}

.statistics-header {
  text-align: center;
  margin-bottom: 15px;
}

.statistics-title {
  font-size: 1.75rem;
  margin-bottom: 10px;
}

.statistics-items {
  display: flex;
  justify-content: space-evenly;
  align-items: stretch;
  min-height: max-content;
}

.statistics-item {
  margin-bottom: 15px;
}

.statistics-label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  font-size: 1.3rem;
}

.statistics-text {
  font-size: 1.2rem;
}
.changed-true {
  font-size: 1.2rem;
  color: green;
}

.changed-false {
  font-size: 1.2rem;
  color: red;
}
</style> -->
