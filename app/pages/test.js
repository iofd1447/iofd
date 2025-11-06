import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://ollvzpokrotcomfqdomk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbHZ6cG9rcm90Y29tZnFkb21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjcxNDMsImV4cCI6MjA3NzYwMzE0M30.t1RCbRDj0HtlxGerXogHdFMLOB0XzJW756yU1hUxSus')

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test123@example.com',
    password: '12345678'
  })
  console.log({ data, error })
}

test()
