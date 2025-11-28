export interface Facility {
  id: number
  name: string
  district: string
  level: string
}

export interface Indicator {
  id: number
  code: string
  name: string
  data_source: string
}

export interface DqaLineCreate {
  indicator_id: number
  recount_register?: number | null
  figure_105?: number | null
  figure_dhis2?: number | null
}

export interface DqaLineResponse {
  id: number
  indicator_id: number
  recount_register?: number | null
  figure_105?: number | null
  figure_dhis2?: number | null
  dev_dhis2_vs_reg?: number | null
  dev_105_vs_reg?: number | null
  dev_105_vs_dhis2?: number | null
  indicator: Indicator
}

export interface DqaSessionCreate {
  facility_id: number
  period: string
  team: string
  lines: DqaLineCreate[]
}

export interface DqaSessionResponse {
  id: number
  facility_id: number
  period: string
  created_at: string
  team?: string | null
  facility: Facility
  lines: DqaLineResponse[]
}

export interface DqaSessionSummary {
  id: number
  facility_id: number
  period: string
  created_at: string
  team?: string | null
  facility_name: string
  district: string
  line_count: number
  red_count: number
  amber_count: number
}

export interface TeamsResponse {
  [key: string]: string[]
}

