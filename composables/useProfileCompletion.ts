import { ref } from 'vue'

export interface ChecklistItem {
  id: string
  title: string
  desc: string
  weight: number
  completed: boolean
  action_label: string
  action_route: string
}

export interface ProfileCompletionData {
  score: number
  percentage: number
  status: 'orange' | 'yellow' | 'green'
  status_label: string
  is_ready_for_class: boolean
  checklist: ChecklistItem[]
  missing_count: number
}

const completionData = ref<ProfileCompletionData>({
  score: 100,
  percentage: 100,
  status: 'green',
  status_label: 'Profile Complete',
  is_ready_for_class: true,
  checklist: [],
  missing_count: 0
})

const isLoading = ref(false)

export function useProfileCompletion() {
  const fetchCompletion = async (_uid?: string) => {
    // Standalone fallback: can be overridden by consumer application
    return completionData.value
  }

  return {
    completion: completionData,
    isLoading,
    fetchCompletion
  }
}
