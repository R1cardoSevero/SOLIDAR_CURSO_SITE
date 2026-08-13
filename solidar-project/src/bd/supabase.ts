import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bizgpackdoggsnodeilz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpemdwYWNrZG9nZ3Nub2RlaWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MjU2MzIsImV4cCI6MjEwMjEwMTYzMn0.ebCP1A0QPyCCPpRBe6MN-Ny-EKpnfhsf0735RAjAf08'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)