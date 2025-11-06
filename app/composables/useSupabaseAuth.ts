import { computed, ref } from 'vue'
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

      if (data.user) {
        const { error: userError } = await supabase.from('users').insert([{
          auth_id: data.user.id,
          email: data.user.email,
          username: email.split('@')[0],
          role: 'user'
        }])
        if (userError) throw userError
      }

      user.value = data.user
      return data
    }
    catch (err: any) {
      console.error("Erreur insertion user:", err);
    }
    finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (profileData: any) => {
    if (!user.value) throw new Error('Utilisateur non connecté')
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.value.id)
        .select()
        .single()
      if (error) throw error

      user.value = { ...user.value, ...data }
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: profileData.username }
      })
      if (metadataError) throw metadataError

      return data
    } finally {
      loading.value = false
    }
  }

  const syncUser = async () => {
    if (!user.value) return
    loading.value = true
    try {
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (!existingUser) {
        await supabase.from('users').insert([{
          id: user.value.id,
          email: user.value.email,
          username: user.value.email.split('@')[0],
          role: 'user'
        }])
      }
    } catch (err) {
      console.error('Erreur syncUser:', err)
    } finally {
      loading.value = false
    }
  }

  async function logContribution(productId: string, email: string, changeType: 'create' | 'update', changeData: any) {

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase());


    if (userError) {
      console.error('Erreur lors de la récupération de l’utilisateur', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('Aucun utilisateur trouvé avec cet email');
      return;
    }

    // @ts-ignore
    const userId = users[0].id;

    const { data: productData, error: productError } = await supabase
      .from('product_contributors')
      .insert([{ product_id: productId, user_id: userId, change_type: changeType, change_data: changeData }]);

    if (productError) {
      console.error('Erreur logContribution:', productError);
    }
  }

  const deleteAccount = async () => {
    if (!user.value) throw new Error('Aucun utilisateur connecté')

    loading.value = true
    try {
      const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.value.id)

      if (deleteUserError) throw deleteUserError

      await signOut()

      user.value = null
    } finally {
      loading.value = false
    }
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
    logContribution,
    deleteAccount,
    syncUser
  }
}
