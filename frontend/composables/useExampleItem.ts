import { reactive, useContext } from '@nuxtjs/composition-api'
import _ from 'lodash'
import { ExampleDTO } from '@/services/application/example/exampleData'

export const useExampleItem = () => {
  const state = reactive({
    example: {} as ExampleDTO,
    totalExample: 0,
    progress: {}
  })

  const { app } = useContext()
  const exampleService = app.$services.example

  const getExample = async (
    projectId: string,
    {
      page,
      q,
      isChecked,
      ordering
    }: { page: string; q: string; isChecked: string; ordering: string }
  ) => {
    const examples = await exampleService.fetchOne(projectId, page, q, isChecked, ordering)
    state.totalExample = examples.count
    if (!_.isEmpty(examples) && examples.items.length !== 0) {
      state.example = examples.items[0]
    }
  }

  const getExampleById = async (projectId: string) => {
    state.example = await exampleService.findById(projectId, state.example.id)
  }

  const updateProgress = async (projectId: string) => {
    state.progress = await app.$repositories.metrics.fetchMyProgress(projectId)
  }

  const confirm = async (projectId: string) => {
    await exampleService.confirm(projectId, state.example.id)
    await getExampleById(projectId)
    updateProgress(projectId)
  }

  const updateTime = async (projectId : string, example : ExampleDTO) => {
    await exampleService.update(projectId,example)
    // const checkEx = await exampleService.findById(projectId,example.id)
    // console.log(checkEx)
  }

  const fetchExampleById = async(projectId: string, exampleId : string) =>{
    const ex =  await exampleService.findById(projectId,exampleId)
    return ex
  }
  return {
    state,
    confirm,
    getExample,
    updateProgress,
    updateTime,
    fetchExampleById
  }
}
