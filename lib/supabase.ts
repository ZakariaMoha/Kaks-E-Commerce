import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'customer' | 'creator' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'customer' | 'creator' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'customer' | 'creator' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          category_id: string | null
          images: string[]
          stock_quantity: number
          sku: string | null
          weight: number | null
          featured: boolean
          status: 'active' | 'inactive' | 'draft'
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          category_id?: string | null
          images?: string[]
          stock_quantity?: number
          sku?: string | null
          weight?: number | null
          featured?: boolean
          status?: 'active' | 'inactive' | 'draft'
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          category_id?: string | null
          images?: string[]
          stock_quantity?: number
          sku?: string | null
          weight?: number | null
          featured?: boolean
          status?: 'active' | 'inactive' | 'draft'
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          email: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          total_amount: number
          promo_code_id: string | null
          stripe_payment_intent_id: string | null
          billing_address: any
          shipping_address: any
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          email: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount: number
          promo_code_id?: string | null
          stripe_payment_intent_id?: string | null
          billing_address?: any
          shipping_address?: any
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          email?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          promo_code_id?: string | null
          stripe_payment_intent_id?: string | null
          billing_address?: any
          shipping_address?: any
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed'
          value: number
          min_order_amount: number | null
          max_discount: number | null
          usage_limit: number | null
          usage_count: number
          creator_id: string | null
          valid_from: string
          valid_until: string | null
          status: 'active' | 'inactive' | 'expired'
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          type?: 'percentage' | 'fixed'
          value: number
          min_order_amount?: number | null
          max_discount?: number | null
          usage_limit?: number | null
          usage_count?: number
          creator_id?: string | null
          valid_from?: string
          valid_until?: string | null
          status?: 'active' | 'inactive' | 'expired'
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: 'percentage' | 'fixed'
          value?: number
          min_order_amount?: number | null
          max_discount?: number | null
          usage_limit?: number | null
          usage_count?: number
          creator_id?: string | null
          valid_from?: string
          valid_until?: string | null
          status?: 'active' | 'inactive' | 'expired'
          created_at?: string
        }
      }
    }
  }
}