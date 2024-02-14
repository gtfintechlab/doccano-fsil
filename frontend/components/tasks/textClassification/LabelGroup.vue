<template>
    <div style="display: flex;align-items: safe center;">
  <label-group-single
    v-if="singleLabel"
    :annotations="annotations"
    :labels="labels"
    @add="$emit('add', $event)"
    @remove="$emit('remove', $event)"
  />
  <label-group-multi
    v-else
    :annotations="annotations"
    :labels="labels"
    @changeAnnotation="$emit('change')"
    @add="$emit('add', $event)"
    @remove="$emit('remove', $event)"
  />
  
            <v-tooltip color="black" right>
                <template #activator="{ on, attrs }">
                <div
                    v-bind="attrs"
                    style="width:min-content;"
                    v-on="on"
                >
                <v-switch 
                v-model="confidence"
                :append-icon = "mdiClipboardCheck"  
                color = "green"  
                checked = "on"
                @change = "callForChange"
                >
                </v-switch>
                </div>
                </template>
                <div>
                Confidence Check
                </div>
            </v-tooltip>
</div>
</template>

<script>
import {mdiClipboardCheck} from '@mdi/js'
import LabelGroupSingle from './singleLabel/LabelGroup.vue'
import LabelGroupMulti from './multiLabel/LabelGroup.vue'

export default {
  components: {
    LabelGroupSingle,
    LabelGroupMulti
  },

  props: {
    labels: {
      type: Array,
      default: () => [],
      required: true
    },
    annotations: {
      type: Array,
      default: () => [],
      required: true
    },
    singleLabel: {
      type: Boolean,
      default: false,
      required: true
    },
    exampleConf : {
        type : Boolean,
        default : true,
        required: false
    }
  },
  data(){
    return{
        confidence : this.exampleConf || true,
        mdiClipboardCheck
    }
  },
  beforeMount(){
    this.confidence = this.exampleConf
  },
  beforeUpdate(){
    this.confidence = this.exampleConf
  },
  methods:{
    callForChange(){
        this.$emit("confidencechange",this.confidence)
    }
  }
}
</script>
