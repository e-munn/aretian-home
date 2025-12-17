import { useState, useEffect } from 'react'
import { load } from '@loaders.gl/core'
import { CSVLoader } from '@loaders.gl/csv'

// Housing data structure - matches metrics_housing_v2 CSV
export interface HousingScoreData {
  section_id: string
  norm_multi_family_score: number
  norm_single_family_score: number
  norm_score: number
  urban_parcel_classification: string
  norm_optimal_housing_type: string
  num_housing_units: number
  municipality_name: string
  comarca: string
  district_name: string
  lat: number
  lon: number
  cluster_sc: number
  cluster_description: string
  household_income_sc: number
  multi_family_rental_ppm2_sc: number
  multi_family_purchase_ppm2_percentile_sc: number
  single_family_rental_ppm2_sc: number
  single_family_purchase_ppm2_percentile_sc: number
  office_analysis: string
  office_rental_ppm2: number
}

export interface HousingDataMap {
  _type: 'section_based'
  data: Record<string, HousingScoreData>
}

interface UseHousingDataResult {
  housingData: HousingDataMap | null
  isLoading: boolean
  error: Error | null
}

// Singleton cache to prevent duplicate fetches
let cachedHousingData: HousingDataMap | null = null
let cachePromise: Promise<HousingDataMap> | null = null

async function fetchHousingData(): Promise<HousingDataMap> {
  if (cachePromise) return cachePromise
  if (cachedHousingData) return cachedHousingData

  console.log('🏠 Loading housing data from CSV...')

  cachePromise = load('/metrics_housing_v2.csv', CSVLoader, {
    csv: {
      header: true,
      dynamicTyping: true
    },
    worker: true
  })
    .then(rows => {
      const dataObject: Record<string, HousingScoreData> = {}

      rows.forEach(row => {
        const sectionId = String(row.section_id)
        if (sectionId) {
          const processedRow: HousingScoreData = {
            section_id: sectionId,
            norm_multi_family_score: Number(row.norm_multi_family_score) || 0,
            norm_single_family_score: Number(row.norm_single_family_score) || 0,
            norm_score: Number(row.norm_score) || 0,
            urban_parcel_classification: row.urban_parcel_classification || '',
            norm_optimal_housing_type: row.norm_optimal_housing_type || '',
            num_housing_units: Number(row.num_housing_units) || 0,
            municipality_name: row.municipality_name || '',
            comarca: row.comarca || '',
            district_name: row.district_name || '',
            lat: Number(row.lat) || 0,
            lon: Number(row.lon) || 0,
            cluster_sc: Number(row.cluster_sc) || 0,
            cluster_description: row.cluster_description || '',
            household_income_sc: Number(row.household_income_sc) || 0,
            multi_family_rental_ppm2_sc: Number(row.multi_family_rental_ppm2_sc) || 0,
            multi_family_purchase_ppm2_percentile_sc: Number(row.multi_family_purchase_ppm2_percentile_sc) || 0,
            single_family_rental_ppm2_sc: Number(row.single_family_rental_ppm2_sc) || 0,
            single_family_purchase_ppm2_percentile_sc: Number(row.single_family_purchase_ppm2_percentile_sc) || 0,
            office_analysis: row.office_analysis || '',
            office_rental_ppm2: Number(row.office_rental_ppm2) || 0
          }
          dataObject[sectionId] = processedRow
        }
      })

      const wrappedData = {
        _type: 'section_based' as const,
        data: dataObject
      }

      cachedHousingData = wrappedData
      cachePromise = null

      console.log(`✅ Loaded ${Object.keys(dataObject).length} housing sections from CSV`)
      return wrappedData
    })
    .catch(error => {
      console.error('❌ Failed to load housing data:', error)
      cachePromise = null
      throw error
    })

  return cachePromise
}

export function useHousingData(): UseHousingDataResult {
  const [housingData, setHousingData] = useState<HousingDataMap | null>(cachedHousingData)
  const [isLoading, setIsLoading] = useState(!cachedHousingData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!housingData && !cachePromise) {
      setIsLoading(true)
      setError(null)

      fetchHousingData()
        .then(data => {
          setHousingData(data)
          setIsLoading(false)
        })
        .catch(err => {
          setError(err)
          setIsLoading(false)
        })
    }
  }, [housingData])

  return {
    housingData,
    isLoading,
    error
  }
}

export function getHousingScoreForSection(
  housingData: HousingDataMap | null,
  sectionId: string,
  scoreType: keyof HousingScoreData = 'norm_score'
): number | null {
  if (!housingData || !housingData.data[sectionId]) {
    return null
  }

  const section = housingData.data[sectionId]
  return section[scoreType] as number || null
}
