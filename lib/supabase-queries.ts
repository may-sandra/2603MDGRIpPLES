import { supabase } from './supabase-client'

export async function fetchCountyData(county: string) {
  const { data, error } = await supabase
    .from('energy_data')
    .select('*')
    .eq('county', county)

  if (error) {
    console.error('Error fetching county data:', error)
    return []
  }

  return data || []
}

export async function fetchNationalData() {
  const { data, error } = await supabase
    .from('energy_data')
    .select('*')
    .eq('county', 'National')

  if (error) {
    console.error('Error fetching national data:', error)
    return []
  }

  return data || []
}

export async function fetchAllCountiesData() {
  const { data, error } = await supabase
    .from('energy_data')
    .select('*')
    .neq('county', 'National')

  if (error) {
    console.error('Error fetching counties data:', error)
    return []
  }

  return data || []
}

export async function fetchCountiesList() {
  const { data, error } = await supabase
    .from('energy_data')
    .select('county')
    .distinct()
    .neq('county', 'National')

  if (error) {
    console.error('Error fetching counties list:', error)
    return []
  }

  return data?.map((item) => item.county) || []
}
