import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'

const supabase = useSupabase()

export const user = ref<any>(null)
export const loading = ref(false)

export function useSupabaseAuth() {

  const isLoggedIn = computed(() => !!user.value)

  const fetchUser = async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    user.value = u
    return u
  }

  const signUp = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return data
    } finally { loading.value = false }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      user.value = data.user
      return data
    } finally { loading.value = false }
  }

  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
    } finally { loading.value = false }
  }

  const updateUserProfile = async (profileData: any) => {
    loading.value = true
    try {
      const { data, error } = await supabase.from('users').update(profileData).eq('id', user.value?.id).select().single()
      if (error) throw error
      user.value = { ...user.value, ...data }
      return data
    } finally { loading.value = false }
  }

  async function logContribution(productId: string, userId: string, changeType: 'create' | 'update', changeData: any) {
    await supabase.from('product_contributors').insert([{ product_id: productId, user_id: userId, change_type: changeType, change_data: changeData }])
  }

  return {
    user,
    loading,
    isLoggedIn,
    fetchUser,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    logContribution
  }
}
