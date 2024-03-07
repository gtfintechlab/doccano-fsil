<!-- eslint-disable vue/no-side-effects-in-computed-properties -->
<template>
    <div v-shortkey="['esc']" @shortkey="cleanUp">
      <v-annotator
        :dark="$vuetify.theme.dark"
        :rtl="rtl"
        :text="text"
        :entities="entities"
        :entity-labels="entityLabels"
        :relations="relations"
        :relation-labels="relationLabels"
        :allow-overlapping="allowOverlapping"
        :grapheme-mode="graphemeMode"
        :selected-entities="selectedEntities"
        @add:entity="handleAddEvent"
        @click:entity="onEntityClicked"
        @click:relation="onRelationClicked"
        @contextmenu:entity="deleteEntity"
        @contextmenu:relation="deleteRelation"
      />
      <!-- <v-card v-if="toggleDev" class="statistics-card"
        style = "  background-color: #f5f5f5;
        border: 1px solid #ccc;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 15px;">

        <div style="text-align: center;">
            <h3 style="center margin-bottom: 15px;">Additional Statistics</h3>
        </div>
        <div v-if="entityMenuOpened && !currentLabel" 
        style="font-weight: bold; margin-bottom: 10px;">
            Selection Text: {{ text.slice(startOffset, endOffset) }}
        </div>
        <template v-if="currentLabel">
            <div style="font-weight: bold; margin-bottom: 10px;">
            Selection Text: {{ text.slice(entity.startOffset, entity.endOffset) }}
            </div>
            <div style="margin-bottom: 5px;">
            <span style="font-weight: bold;">Class:</span> {{ currentLabel.text }}
            </div>
            <div style="margin-bottom: 5px;">
            <span style="font-weight: bold;">Interaction Time:</span>
            {{ entityStartTimes[entity.id] || 0 }} seconds
            </div>
            <div style="margin-bottom: 5px;">
            <span style="font-weight: bold;">Changed:</span>
            {{ (entityChanged[entity.id] || false).toString() }}
            </div>
        </template>
      </v-card> -->
      <labeling-menu
        :opened="entityMenuOpened"
        :x="x"
        :y="y"
        :selected-label="currentLabel"
        :labels="entityLabels"
        @close="cleanUp"
        @click:label="addOrUpdateEntity"
      />
      <labeling-menu
        :opened="relationMenuOpened"
        :x="x"
        :y="y"
        :selected-label="currentRelationLabel"
        :labels="relationLabels"
        @close="cleanUp"
        @click:label="addOrUpdateRelation"
      />
    </div>
  </template>
  
  <script lang="ts">
  import VAnnotator from 'v-annotator'
  import type { PropType } from 'vue'
  import Vue from 'vue'
  import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
  import LabelingMenu from './LabelingMenu.vue'
  import { SpanDTO } from '~/services/application/tasks/sequenceLabeling/sequenceLabelingData'
  
  
  export default Vue.extend({
    components: {
      VAnnotator,
      LabelingMenu
    },
  
    props: {
      dark: {
        type: Boolean,
        default: false
      },
      rtl: {
        type: Boolean,
        default: false
      },
      text: {
        type: String,
        default: '',
        required: true
      },
      entities: {
        type: Array as PropType<SpanDTO[]>,
        default: () => [],
        required: true
      },
      entityLabels: {
        type: Array,
        default: () => [],
        required: true
      },
      relations: {
        type: Array,
        default: () => []
      },
      relationLabels: {
        type: Array,
        default: () => []
      },
      allowOverlapping: {
        type: Boolean,
        default: false,
        required: false
      },
      graphemeMode: {
        type: Boolean,
        default: false
      },
      selectedLabel: {
        type: Object,
        default: null,
        required: false
      },
      relationMode: {
        type: Boolean,
        default: false
      },
      toggleDev:{
        type: Boolean,
        default : false
      }
    },
  
    data() {
      return {
        startTimes: {} as Record<number, Date>,
        entityTimes: {} as Record<number, number>,
        entityStartTimes :{} as Record<number,number>,
        entityChanged :{} as Record<number,boolean>,
        
        updateInterval: null,
        entityMenuOpened: false,
        relationMenuOpened: false,
        x: 0,
        y: 0,
        startOffset: 0,
        endOffset: 0,
        entity: null as any,
        relation: null as any,
        selectedEntities: [] as SpanDTO[],
      }
    },
  
    computed: {
      elapsedTime():any {
      const elapsedTimes = {} as Record<number, number>;
  
      for (const entityId in this.startTimes) {
          if (Object.prototype.hasOwnProperty.call(this.startTimes, entityId))  {
          if (!(entityId in this.entityStartTimes)){
              // eslint-disable-next-line vue/no-side-effects-in-computed-properties
              this.entityStartTimes[entityId] = 0
          }
          const startTime = this.startTimes[entityId];
          const currentTime = new Date();
          const timeDiff = currentTime.getTime() - startTime.getTime();
          
          elapsedTimes[entityId] = timeDiff / 1000; // Elapsed time in seconds
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.entityStartTimes[entityId] += elapsedTimes[entityId]
        }
      }
      return elapsedTimes;
    },
      currentLabel(): any {
        if (this.entity) {
          const label = this.entityLabels.find((label: any) => label.id === this.entity!.label)
          return label
        } else {
          return null
        }
      },
  
      currentRelationLabel(): any {
        if (this.relation) {
          const label = this.relationLabels.find((label: any) => label.id === this.relation.labelId)
          return label
        } else {
          return null
        }
      }
    },
  
    methods: {
      getStartAndEndOffsetById(id : null) {
          const entity = this.entities.find(entity => entity.id === id);
          if (entity) {
          return {
              startOffset: entity.startOffset,
              endOffset: entity.endOffset
          };
          }
          return { startOffset: null, endOffset: null }; 
      },
      setOffset(startOffset: number, endOffset: number) {
        this.startOffset = startOffset
        this.endOffset = endOffset
      },
  
      setEntity(entityId: number) {
        this.entity = this.entities.find((entity: any) => entity.id === entityId)
      },
  
      setRelation(relationId: number) {
        this.relation = this.relations.find((relation: any) => relation.id === relationId)
      },
  
      setEntityForRelation(e: Event, entityId: number) {
        const entity = this.entities.find((entity) => entity.id === entityId)!
        const index = this.selectedEntities.findIndex((e) => e.id === entity.id)
        if (index === -1) {
          this.selectedEntities.push(entity)
        } else {
          this.selectedEntities.splice(index, 1)
        }
        if (this.selectedEntities.length === 2) {
          if (this.selectedLabel) {
            this.addRelation(this.selectedLabel.id)
            this.cleanUp()
          } else {
            this.showRelationLabelMenu(e)
          }
        }
      },
  
      showEntityLabelMenu(e: any) {
        e.preventDefault()
        this.entityMenuOpened = false
        this.x = e.clientX || e.changedTouches[0].clientX
        this.y = e.clientY || e.changedTouches[0].clientY
        this.$nextTick(() => {
          this.entityMenuOpened = true
        })
      },
  
      showRelationLabelMenu(e: any) {
        e.preventDefault()
        this.relationMenuOpened = false
        this.x = e.clientX || e.changedTouches[0].clientX
        this.y = e.clientY || e.changedTouches[0].clientY
        this.$nextTick(() => {
          this.relationMenuOpened = true
        })
      },
  
      handleAddEvent(e: any, startOffset: number, endOffset: number) {
        this.setOffset(startOffset, endOffset)
        if (this.selectedLabel) {
          this.addOrUpdateEntity(this.selectedLabel.id)
        } else {
          this.showEntityLabelMenu(e)
        }
      },
  
      onEntityClicked(e: any, entityId: number) {
      
      this.$set(this.startTimes, entityId, new Date());
  
        if (this.relationMode) {
          this.setEntityForRelation(e, entityId)
        } else {
          this.setEntity(entityId)
          this.showEntityLabelMenu(e)
        }
      },
  
      onRelationClicked(e: any, relation: any) {
        this.setRelation(relation.id)
        this.showRelationLabelMenu(e)
      },
  
      addOrUpdateEntity(labelId: number) {
        
        if (labelId) {
          if (this.entity) {
            if(this.entity.changed === false && this.entity.label !== labelId){
                this.$set(this.entityChanged,this.entity.id,true)
                this.entity.changed = true
            }
            this.updateEntity(labelId)
          } else {
            this.addEntity(labelId)
          }
        } else {
          this.deleteEntity(this.entity)
        }
        this.cleanUp()
      },
  
      addOrUpdateRelation(labelId: number) {
        if (labelId) {
          if (this.relation) {
            this.updateRelation(labelId)
          } else {
            this.addRelation(labelId)
          }
        } else {
          this.deleteRelation(this.relation)
        }
        this.cleanUp()
      },
  
      addEntity(labelId: number) {
        this.$emit('addEntity', this.startOffset, this.endOffset, labelId,true)
      },
  
      updateEntity(labelId: number) {
        this.$emit('click:entity', this.entity!.id, labelId)
      },
  
      deleteEntity(entity: any) {
        this.$emit('contextmenu:entity', entity.id)
        this.cleanUp()
      },
  
      cleanUp() {
      
      for (const entityId in this.startTimes) {
          
          const startTime = this.startTimes[entityId];
          const endTime = new Date();
          const timeDiff = endTime.getTime() - startTime.getTime();
          const elapsedSeconds = timeDiff / 1000; // Convert to seconds
  
          // Update the "time" property for the specific entity
          if (!this.entityTimes[entityId]) {
            this.$set(this.entityTimes, entityId, 0);
          }
          this.entityTimes[entityId] += elapsedSeconds;
          if (this.elapsedTime[entityId] <= 0.5){
              this.entityStartTimes[entityId] += 
              Number(Math.max(elapsedSeconds,this.elapsedTime[entityId]))
              
              
          }
          this.entityStartTimes[entityId] = Number(this.entityStartTimes[entityId].toFixed(2))
        
      }
  
      
      this.startTimes = {};
        this.entityMenuOpened = false
        this.relationMenuOpened = false
        this.entity = null
        this.relation = null
        this.startOffset = 0
        this.endOffset = 0
        this.selectedEntities = []
      },
  
      addRelation(labelId: number) {
        const [fromEntity, toEntity] = this.selectedEntities
        this.$emit('addRelation', fromEntity.id, toEntity.id, labelId)
      },
  
      updateRelation(labelId: number) {
        this.$emit('click:relation', this.relation.id, labelId)
      },
  
      deleteRelation(relation: any) {
        this.$emit('contextmenu:relation', relation.id)
      }
    }
  })
  </script>
  