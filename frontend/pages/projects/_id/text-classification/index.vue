<!-- eslint-disable vue/component-tags-order -->
<template>
  <layout-text v-if="example.id">
    
    <template #header>
        <div style="justify-items: legacy right;padding-left: 10px;">
            </v-switch>
            <v-tooltip color="black" top>
                <template #activator="{ on, attrs }">
                <div
                    v-bind="attrs"
                    v-on="on"
                    style="width:min-content;"
                >
                    
                <v-switch 
                v-model="toggleddev"
                :prepend-icon = "mdiAccountCogOutline"  
                color = "deep-orange" 
                disabled 
                >
                    </v-switch>
                </div>
                </template>
                <div>
                Display Additional Statistics
                </div>
            </v-tooltip>
        </div>
      <toolbar-laptop
        :doc-id="example.id"
        :enable-auto-labeling.sync="enableAutoLabeling"
        :guideline-text="project.guideline"
        :is-reviewd="example.isConfirmed"
        :total="totalExample"
        :timeanot = "AnotDict[example.id]"
        :example = "example"
        :proj-id = "project.id"
        class="d-none d-sm-block"
        @click:clear-label="clearTeacherList(project.id, example.id)"
        @click:review="confirm(project.id)"
        @messageFromChild = "messagetoollap"
      >
      <v-btn-toggle v-model="activeButton" @change="resetActiveButton">
      <v-tooltip v-if="toggleddev" bottom>
        <template  #activator="{ on, tooltip }">
      <v-btn icon @click = "refreshTime" >
        <v-icon v-bind = "tooltip"  v-on = "on"  >
            {{ mdiTimerRefreshOutline }}
        </v-icon>
        
      </v-btn>
      </template>
      <span>Refresh Timer</span>
      </v-tooltip>
      <v-tooltip v-if="toggleddev" bottom>
        <template  #activator="{ on, tooltip }">
      <v-btn icon @click="refreshChanged">
            <v-icon v-bind = "tooltip"  v-on = "on"  >
                {{ mdiDatabaseRefreshOutline }}
            </v-icon>
      </v-btn>
      </template>
      <span>Refresh Changed Value</span>
      </v-tooltip>
      
    </v-btn-toggle>
      
         
      <!-- <v-range-slider
      v-model="range"
      label = "Confidence Score : "
    :step="1"
    hide-details
  >
  </v-range-slider> -->
        <button-label-switch class="ms-2" @change="labelComponent = $event" />
        
      </toolbar-laptop>
      
      <toolbar-mobile :total="totalExample" class="d-flex d-sm-none" />
      
    </template>
    <template #content>
      <v-card
        v-shortkey="shortKeys"
        @shortkey="annotateOrRemoveLabel(project.id, example.id, $event.srcKey)"
      >
        <v-card-title>
          <component
            :is="labelComponent"
            :labels="labels"
            :annotations="teacherList"
            :single-label="project.singleClassClassification"
            :example-conf = "example.confidence"
            @add="annotateLabel(project.id, example.id, $event)"
            @remove="removeTeacher(project.id, example.id, $event)"
            @confidencechange = "confidenceChange"
            @change = "anotChange"
          />
          


      
          
          
        </v-card-title>
        <v-divider />
        <v-card-text class="title highlight" style="white-space: pre-wrap" v-text="example.text" />
      </v-card>
      <v-card v-if="toggleddev" class="additional-statistics">
            <div class="statistics-header">
                <h3 class="statistics-title">Additional Statistics</h3>
            </div>
                <div class="statistics-items">
                    <div class="statistics-item">
                        <span class="statistics-label">Elapsed Time</span>
                        <div class="statistics-text">{{ formatTime(AnotDict[example.id]) }}</div>
                    </div>
                    <div class="statistics-item">
                        <span class="statistics-label">Confidence</span>
                        <div :class="{
                            'changed-true': example.confidence,
                            'changed-false': !example.confidence
                        }">
                        {{ renderChangedStatus(example.confidence) }}
                        </div>
                    </div>
                    <div class="statistics-item">
                        <div class="statistics-item">
                            <span class="statistics-label">Assignment Changed</span>
                            <div class="statistics-text" :class="{
                                'changed-true': example.changed,
                                'changed-false': !example.changed
                            }">{{ renderChangedStatus(example.changed) }}
                            </div>
                        </div>
                    </div>
                </div>
    </v-card>      
    </template>
    <template #sidebar>
      <annotation-progress :progress="progress" />
      <list-metadata :metadata="example.meta" class="mt-4" />
    </template>
  </layout-text>
</template>

<script>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { mdiAccountCogOutline,mdiClipboardCheck,mdiDatabaseRefreshOutline,mdiTimerRefreshOutline} from '@mdi/js'
import { ref, toRefs, useContext, useFetch, watch } from '@nuxtjs/composition-api'
import LayoutText from '@/components/tasks/layout/LayoutText'
import ListMetadata from '@/components/tasks/metadata/ListMetadata'
import AnnotationProgress from '@/components/tasks/sidebar/AnnotationProgress.vue'
import LabelGroup from '@/components/tasks/textClassification/LabelGroup'
import LabelSelect from '@/components/tasks/textClassification/LabelSelect'
import ButtonLabelSwitch from '@/components/tasks/toolbar/buttons/ButtonLabelSwitch'
import ToolbarLaptop from '@/components/tasks/toolbar/ToolbarLaptop'
import ToolbarMobile from '@/components/tasks/toolbar/ToolbarMobile'
import { useExampleItem } from '@/composables/useExampleItem'
import { useLabelList } from '@/composables/useLabelList'
import { useProjectItem } from '@/composables/useProjectItem'
import { useTeacherList } from '@/composables/useTeacherList'

export default {
  components: {
    AnnotationProgress,
    ButtonLabelSwitch,
    LabelGroup,
    LabelSelect,
    LayoutText,
    ListMetadata,
    ToolbarLaptop,
    ToolbarMobile
  },
  layout: 'workspace',

  validate({ params, query }) {
    return /^\d+$/.test(params.id) && /^\d+$/.test(query.page)
  },
  setup() {
    const { app, params, query } = useContext()
    // exampleservice = app.$services.example
    // const examplenos = 
    const projectId = params.value.id
    
    const { state: projectState, getProjectById } = useProjectItem()
    const { state: exampleState, confirm, updateProgress, getExample,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        updateTime,fetchExampleById } = useExampleItem()
    
    // console.log(projectState)
    // console.log(projectId)
    // console.log(exampleState)
    const {
      state: teacherState,
      annotateLabel,
      annotateOrRemoveLabel,
      autoLabel,
      clearTeacherList,
      getTeacherList,
      removeTeacher,
      toggleDev
    } = useTeacherList(app.$repositories.category)
    const enableAutoLabeling = ref(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const storedAnotDict = {}
    const { state: labelState, getLabelList, shortKeys } = useLabelList(app.$services.categoryType)
    const labelComponent = ref('label-group')

    getLabelList(projectId)
    getProjectById(projectId)
    updateProgress(projectId)
    // updateTime(projectId,)
    
    const { fetch } = useFetch(async () => {
      await getExample(projectId, query.value)
      
      
    //   console.log("Example State")
    //   const rf  = await fetchExampleById(projectId,exampleState.example.id)
    //   console.log("printing it here : ",rf)
    //   console.log(exampleState.example.text,exampleState.example.time_annotated,
    //   exampleState.example.confidence)
    
      if (enableAutoLabeling.value) {
        try {
          await autoLabel(projectId, exampleState.example.id)
        } catch (e) {
          enableAutoLabeling.value = false
          alert(e.response.data.detail)
        }
      } else {
        await getTeacherList(projectId, exampleState.example.id)
      }
    })
    watch(query, fetch)
    watch(enableAutoLabeling, async (val) => {
      if (val && !exampleState.example.isConfirmed) {
        await autoLabel(exampleState.example.id)
        await getTeacherList(exampleState.example.id)
      }
    })
    

    return {
      ...toRefs(labelState),
      ...toRefs(projectState),
      ...toRefs(teacherState),
      ...toRefs(exampleState),
      confirm,
      annotateLabel,
      annotateOrRemoveLabel,
      clearTeacherList,
      enableAutoLabeling,
      toggleDev,
      labelComponent,
      removeTeacher,
      shortKeys,
      mdiAccountCogOutline,
      mdiClipboardCheck,
      mdiDatabaseRefreshOutline,
      mdiTimerRefreshOutline,
      updateTime,
      fetchExampleById,
      projectId
    }
  },
  data(){
    return{
        toggleddev : false,
        startTime: new Date(),
        elapsedTime: '', 
        elapsedHours : '',
        elapsedMinutes : '',
        elapsedSeconds : '',
        fullTime : '',
        oldId : this.example.id,
        AnotDict:{},
        oldExp : this.example,
        changed : false,
        range : [0,5],
        newpage:false,
        activeButton: null
    }
  },
  mounted() {
    
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
    resetActiveButton() {
        this.$nextTick(() => {
          this.activeButton = null
        })
    },
    async refreshTime(){
        this.example.time_annotated = 0
        this.AnotDict[this.example.id] = 0
        await this.updateTime(this.projectId,this.example)
    },
    async refreshChanged(){
        this.example.changed = 0
        await this.updateTime(this.projectId,this.example)
    },
    async confidenceChange(confidence){
        const newex = this.example;
        newex.confidence = confidence;
        await this.updateTime(this.projectId,newex);
    },
    async anotChange(){
        const newex = this.example;
        newex.changed = true;
        await this.updateTime(this.projectId,newex);
    },
    renderChangedStatus(value) {
      return value ? 'True' : 'False';
    },
    async messagetoollap(timeanot,ex,projId){
        ex.time_annotated = timeanot
        await this.updateTime(projId,ex)
        
    },
    async updateAll(){
      for (const [exampleid, timeanot] of Object.entries(this.AnotDict)) {
        const ex = await this.fetchExampleById(this.projectId,exampleid);
        ex.time_annotated = timeanot;
        await this.updateTime(this.projectId,ex);
      }
    },
    formatTime(seconds) {

        if (typeof seconds === 'undefined') {
        return this.formatTime(this.example.time_annotated);
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
    updateElapsedTime() {

      if(this.AnotDict[this.example.id] !== undefined){
        this.$set(this.AnotDict,this.example.id,1 + this.AnotDict[this.example.id])
      }
      else{ 
        this.$set(this.AnotDict,this.example.id,this.example.time_annotated)
      }
      
      const elapsedSeconds = this.AnotDict[this.example.id];
      
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      const seconds = elapsedSeconds % 60;
      this.elapsedSeconds = seconds;
      this.elapsedHours = hours;
      this.elapsedMinutes = minutes;
      this.elapsedTime = `${hours}h ${minutes}m ${seconds}s`;
    
    },
    }
}
</script>

<style scoped>
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
</style>