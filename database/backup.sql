--
-- PostgreSQL database dump
--

\restrict Uy9nbPPOLUQcsugQwacqXv9qtVhPLPpjQHrMN2aMvfd1VEbmPjgfX064mWweE7N

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_campaigns (
    id integer NOT NULL,
    advertiser_id integer NOT NULL,
    name text NOT NULL,
    target_categories text[] DEFAULT '{}'::text[] NOT NULL,
    target_keywords text[] DEFAULT '{}'::text[] NOT NULL,
    placement text DEFAULT 'all'::text NOT NULL,
    budget_total real NOT NULL,
    budget_remaining real NOT NULL,
    daily_budget real NOT NULL,
    cost_per_click real DEFAULT 2 NOT NULL,
    title text NOT NULL,
    description text,
    image_url text,
    destination_url text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    total_clicks integer DEFAULT 0 NOT NULL,
    total_impressions integer DEFAULT 0 NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ad_campaigns OWNER TO postgres;

--
-- Name: ad_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ad_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ad_campaigns_id_seq OWNER TO postgres;

--
-- Name: ad_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ad_campaigns_id_seq OWNED BY public.ad_campaigns.id;


--
-- Name: ad_clicks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_clicks (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    session_id text NOT NULL,
    click_date text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ad_clicks OWNER TO postgres;

--
-- Name: ad_clicks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ad_clicks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ad_clicks_id_seq OWNER TO postgres;

--
-- Name: ad_clicks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ad_clicks_id_seq OWNED BY public.ad_clicks.id;


--
-- Name: advertiser_balance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advertiser_balance (
    id integer NOT NULL,
    user_id integer NOT NULL,
    balance real DEFAULT 0 NOT NULL,
    total_spent real DEFAULT 0 NOT NULL,
    total_loaded real DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.advertiser_balance OWNER TO postgres;

--
-- Name: advertiser_balance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.advertiser_balance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.advertiser_balance_id_seq OWNER TO postgres;

--
-- Name: advertiser_balance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.advertiser_balance_id_seq OWNED BY public.advertiser_balance.id;


--
-- Name: balance_topup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.balance_topup (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount real NOT NULL,
    method text NOT NULL,
    account_name text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requested_at timestamp without time zone DEFAULT now() NOT NULL,
    processed_at timestamp without time zone
);


ALTER TABLE public.balance_topup OWNER TO postgres;

--
-- Name: balance_topup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.balance_topup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.balance_topup_id_seq OWNER TO postgres;

--
-- Name: balance_topup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.balance_topup_id_seq OWNED BY public.balance_topup.id;


--
-- Name: business_leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_leads (
    id integer NOT NULL,
    company_name text NOT NULL,
    contact_name text NOT NULL,
    email text NOT NULL,
    phone text,
    website text,
    product_count text,
    message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.business_leads OWNER TO postgres;

--
-- Name: business_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_leads_id_seq OWNER TO postgres;

--
-- Name: business_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_leads_id_seq OWNED BY public.business_leads.id;


--
-- Name: champion_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.champion_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    year_month text NOT NULL,
    final_rank integer NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    earnings real DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.champion_history OWNER TO postgres;

--
-- Name: champion_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.champion_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.champion_history_id_seq OWNER TO postgres;

--
-- Name: champion_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.champion_history_id_seq OWNED BY public.champion_history.id;


--
-- Name: collection_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collection_items (
    id integer NOT NULL,
    collection_id integer NOT NULL,
    product_id integer NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    added_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.collection_items OWNER TO postgres;

--
-- Name: collection_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.collection_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.collection_items_id_seq OWNER TO postgres;

--
-- Name: collection_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.collection_items_id_seq OWNED BY public.collection_items.id;


--
-- Name: collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collections (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    is_public boolean DEFAULT true NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.collections OWNER TO postgres;

--
-- Name: collections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.collections_id_seq OWNER TO postgres;

--
-- Name: collections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.collections_id_seq OWNED BY public.collections.id;


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complaints (
    id integer NOT NULL,
    reporter_user_id integer,
    target_type text NOT NULL,
    target_id integer NOT NULL,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    resolved_by_user_id integer,
    resolved_at timestamp without time zone,
    action_taken text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.complaints OWNER TO postgres;

--
-- Name: complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.complaints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.complaints_id_seq OWNER TO postgres;

--
-- Name: complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.complaints_id_seq OWNED BY public.complaints.id;


--
-- Name: game_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_scores (
    id integer NOT NULL,
    player_name text DEFAULT 'Anonim'::text NOT NULL,
    product_id integer NOT NULL,
    guessed_price real NOT NULL,
    actual_price real NOT NULL,
    score integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.game_scores OWNER TO postgres;

--
-- Name: game_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_scores_id_seq OWNER TO postgres;

--
-- Name: game_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_scores_id_seq OWNED BY public.game_scores.id;


--
-- Name: monthly_pool; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monthly_pool (
    id integer NOT NULL,
    year_month text NOT NULL,
    affiliate_revenue real DEFAULT 0 NOT NULL,
    ad_revenue real DEFAULT 0 NOT NULL,
    subscription_revenue real DEFAULT 0 NOT NULL,
    total_revenue real DEFAULT 0 NOT NULL,
    pool_percent real DEFAULT 30 NOT NULL,
    pool_amount real DEFAULT 0 NOT NULL,
    total_unique_clicks integer DEFAULT 0 NOT NULL,
    price_per_click real DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    calculated_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    registration_reward_pool real DEFAULT 0 NOT NULL
);


ALTER TABLE public.monthly_pool OWNER TO postgres;

--
-- Name: monthly_pool_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monthly_pool_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monthly_pool_id_seq OWNER TO postgres;

--
-- Name: monthly_pool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monthly_pool_id_seq OWNED BY public.monthly_pool.id;


--
-- Name: page_owner_revenue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_owner_revenue (
    id integer NOT NULL,
    product_id integer NOT NULL,
    owner_id integer NOT NULL,
    year_month text NOT NULL,
    page_views integer DEFAULT 0 NOT NULL,
    estimated_revenue real DEFAULT 0 NOT NULL,
    paid_out boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.page_owner_revenue OWNER TO postgres;

--
-- Name: page_owner_revenue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.page_owner_revenue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.page_owner_revenue_id_seq OWNER TO postgres;

--
-- Name: page_owner_revenue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.page_owner_revenue_id_seq OWNED BY public.page_owner_revenue.id;


--
-- Name: point_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.point_events (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type text NOT NULL,
    points integer NOT NULL,
    description text NOT NULL,
    reference_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.point_events OWNER TO postgres;

--
-- Name: point_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.point_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.point_events_id_seq OWNER TO postgres;

--
-- Name: point_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.point_events_id_seq OWNED BY public.point_events.id;


--
-- Name: price_alarms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_alarms (
    id integer NOT NULL,
    product_id integer NOT NULL,
    email text NOT NULL,
    target_price real NOT NULL,
    token text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    triggered_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.price_alarms OWNER TO postgres;

--
-- Name: price_alarms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.price_alarms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.price_alarms_id_seq OWNER TO postgres;

--
-- Name: price_alarms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.price_alarms_id_seq OWNED BY public.price_alarms.id;


--
-- Name: prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prices (
    id integer NOT NULL,
    product_id integer NOT NULL,
    price real NOT NULL,
    note text,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.prices OWNER TO postgres;

--
-- Name: prices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prices_id_seq OWNER TO postgres;

--
-- Name: prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prices_id_seq OWNED BY public.prices.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    brand text NOT NULL,
    category text NOT NULL,
    description text,
    image_url text,
    store text NOT NULL,
    store_url text,
    original_price real NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_offers_json text,
    official_price real,
    official_store_url text,
    official_store_name text,
    created_by_user_id integer,
    affiliate_click_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: raffle_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raffle_tickets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    week_key text NOT NULL,
    ticket_count integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.raffle_tickets OWNER TO postgres;

--
-- Name: raffle_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.raffle_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.raffle_tickets_id_seq OWNER TO postgres;

--
-- Name: raffle_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.raffle_tickets_id_seq OWNED BY public.raffle_tickets.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    product_id integer NOT NULL,
    author_name text NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    tag text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    plan text DEFAULT 'free'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    amount real DEFAULT 49 NOT NULL,
    payment_method text,
    account_info text,
    account_name text,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    requested_at timestamp without time zone DEFAULT now() NOT NULL,
    activated_at timestamp without time zone
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: unique_product_clicks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unique_product_clicks (
    id integer NOT NULL,
    product_id integer NOT NULL,
    creator_user_id integer,
    session_id text NOT NULL,
    year_month text NOT NULL,
    click_date text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.unique_product_clicks OWNER TO postgres;

--
-- Name: unique_product_clicks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unique_product_clicks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.unique_product_clicks_id_seq OWNER TO postgres;

--
-- Name: unique_product_clicks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.unique_product_clicks_id_seq OWNED BY public.unique_product_clicks.id;


--
-- Name: user_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_accounts (
    id integer NOT NULL,
    email text NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    display_name text,
    phone text,
    password_hash text,
    email_verified boolean DEFAULT false NOT NULL,
    phone_verified boolean DEFAULT false NOT NULL,
    otp_code text,
    otp_expiry timestamp without time zone,
    role text DEFAULT 'user'::text NOT NULL,
    loyalty_months integer DEFAULT 0 NOT NULL,
    is_champion boolean DEFAULT false NOT NULL,
    champion_multiplier real DEFAULT 1 NOT NULL,
    bio text,
    social_link text
);


ALTER TABLE public.user_accounts OWNER TO postgres;

--
-- Name: user_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_accounts_id_seq OWNER TO postgres;

--
-- Name: user_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_accounts_id_seq OWNED BY public.user_accounts.id;


--
-- Name: user_daily_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_daily_tasks (
    id integer NOT NULL,
    user_id integer NOT NULL,
    task_type text NOT NULL,
    year_month_day text NOT NULL,
    points_earned integer DEFAULT 0 NOT NULL,
    completed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_daily_tasks OWNER TO postgres;

--
-- Name: user_daily_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_daily_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_daily_tasks_id_seq OWNER TO postgres;

--
-- Name: user_daily_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_daily_tasks_id_seq OWNED BY public.user_daily_tasks.id;


--
-- Name: user_follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_follows (
    id integer NOT NULL,
    follower_id integer NOT NULL,
    following_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_follows OWNER TO postgres;

--
-- Name: user_follows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_follows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_follows_id_seq OWNER TO postgres;

--
-- Name: user_follows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_follows_id_seq OWNED BY public.user_follows.id;


--
-- Name: user_monthly_earnings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_monthly_earnings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    year_month text NOT NULL,
    total_clicks integer DEFAULT 0 NOT NULL,
    earnings_amount real DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_monthly_earnings OWNER TO postgres;

--
-- Name: user_monthly_earnings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_monthly_earnings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_monthly_earnings_id_seq OWNER TO postgres;

--
-- Name: user_monthly_earnings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_monthly_earnings_id_seq OWNED BY public.user_monthly_earnings.id;


--
-- Name: user_monthly_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_monthly_points (
    id integer NOT NULL,
    user_id integer NOT NULL,
    year_month text NOT NULL,
    click_points integer DEFAULT 0 NOT NULL,
    activity_points integer DEFAULT 0 NOT NULL,
    bonus_points integer DEFAULT 0 NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    multiplier real DEFAULT 1 NOT NULL,
    loyalty_bonus real DEFAULT 0 NOT NULL,
    is_champion boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_monthly_points OWNER TO postgres;

--
-- Name: user_monthly_points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_monthly_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_monthly_points_id_seq OWNER TO postgres;

--
-- Name: user_monthly_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_monthly_points_id_seq OWNED BY public.user_monthly_points.id;


--
-- Name: user_streak; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_streak (
    id integer NOT NULL,
    user_id integer NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    longest_streak integer DEFAULT 0 NOT NULL,
    last_active_date text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_streak OWNER TO postgres;

--
-- Name: user_streak_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_streak_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_streak_id_seq OWNER TO postgres;

--
-- Name: user_streak_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_streak_id_seq OWNED BY public.user_streak.id;


--
-- Name: votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.votes (
    id integer NOT NULL,
    product_id integer NOT NULL,
    color text NOT NULL,
    session_id text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.votes OWNER TO postgres;

--
-- Name: votes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.votes_id_seq OWNER TO postgres;

--
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.votes_id_seq OWNED BY public.votes.id;


--
-- Name: withdrawal_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.withdrawal_requests (
    id integer NOT NULL,
    user_id integer NOT NULL,
    year_month text,
    amount real NOT NULL,
    method text NOT NULL,
    account_info text NOT NULL,
    account_name text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    note text,
    requested_at timestamp without time zone DEFAULT now() NOT NULL,
    processed_at timestamp without time zone
);


ALTER TABLE public.withdrawal_requests OWNER TO postgres;

--
-- Name: withdrawal_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.withdrawal_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.withdrawal_requests_id_seq OWNER TO postgres;

--
-- Name: withdrawal_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.withdrawal_requests_id_seq OWNED BY public.withdrawal_requests.id;


--
-- Name: ad_campaigns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns ALTER COLUMN id SET DEFAULT nextval('public.ad_campaigns_id_seq'::regclass);


--
-- Name: ad_clicks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_clicks ALTER COLUMN id SET DEFAULT nextval('public.ad_clicks_id_seq'::regclass);


--
-- Name: advertiser_balance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertiser_balance ALTER COLUMN id SET DEFAULT nextval('public.advertiser_balance_id_seq'::regclass);


--
-- Name: balance_topup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance_topup ALTER COLUMN id SET DEFAULT nextval('public.balance_topup_id_seq'::regclass);


--
-- Name: business_leads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_leads ALTER COLUMN id SET DEFAULT nextval('public.business_leads_id_seq'::regclass);


--
-- Name: champion_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.champion_history ALTER COLUMN id SET DEFAULT nextval('public.champion_history_id_seq'::regclass);


--
-- Name: collection_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_items ALTER COLUMN id SET DEFAULT nextval('public.collection_items_id_seq'::regclass);


--
-- Name: collections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections ALTER COLUMN id SET DEFAULT nextval('public.collections_id_seq'::regclass);


--
-- Name: complaints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints ALTER COLUMN id SET DEFAULT nextval('public.complaints_id_seq'::regclass);


--
-- Name: game_scores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_scores ALTER COLUMN id SET DEFAULT nextval('public.game_scores_id_seq'::regclass);


--
-- Name: monthly_pool id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pool ALTER COLUMN id SET DEFAULT nextval('public.monthly_pool_id_seq'::regclass);


--
-- Name: page_owner_revenue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_owner_revenue ALTER COLUMN id SET DEFAULT nextval('public.page_owner_revenue_id_seq'::regclass);


--
-- Name: point_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_events ALTER COLUMN id SET DEFAULT nextval('public.point_events_id_seq'::regclass);


--
-- Name: price_alarms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_alarms ALTER COLUMN id SET DEFAULT nextval('public.price_alarms_id_seq'::regclass);


--
-- Name: prices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prices ALTER COLUMN id SET DEFAULT nextval('public.prices_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: raffle_tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raffle_tickets ALTER COLUMN id SET DEFAULT nextval('public.raffle_tickets_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: unique_product_clicks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unique_product_clicks ALTER COLUMN id SET DEFAULT nextval('public.unique_product_clicks_id_seq'::regclass);


--
-- Name: user_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_accounts ALTER COLUMN id SET DEFAULT nextval('public.user_accounts_id_seq'::regclass);


--
-- Name: user_daily_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_daily_tasks ALTER COLUMN id SET DEFAULT nextval('public.user_daily_tasks_id_seq'::regclass);


--
-- Name: user_follows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows ALTER COLUMN id SET DEFAULT nextval('public.user_follows_id_seq'::regclass);


--
-- Name: user_monthly_earnings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_monthly_earnings ALTER COLUMN id SET DEFAULT nextval('public.user_monthly_earnings_id_seq'::regclass);


--
-- Name: user_monthly_points id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_monthly_points ALTER COLUMN id SET DEFAULT nextval('public.user_monthly_points_id_seq'::regclass);


--
-- Name: user_streak id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_streak ALTER COLUMN id SET DEFAULT nextval('public.user_streak_id_seq'::regclass);


--
-- Name: votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes ALTER COLUMN id SET DEFAULT nextval('public.votes_id_seq'::regclass);


--
-- Name: withdrawal_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawal_requests ALTER COLUMN id SET DEFAULT nextval('public.withdrawal_requests_id_seq'::regclass);


--
-- Data for Name: ad_campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_campaigns (id, advertiser_id, name, target_categories, target_keywords, placement, budget_total, budget_remaining, daily_budget, cost_per_click, title, description, image_url, destination_url, status, total_clicks, total_impressions, start_date, end_date, created_at) FROM stdin;
\.


--
-- Data for Name: ad_clicks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_clicks (id, campaign_id, session_id, click_date, created_at) FROM stdin;
\.


--
-- Data for Name: advertiser_balance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advertiser_balance (id, user_id, balance, total_spent, total_loaded, updated_at) FROM stdin;
1	1	0	0	0	2026-03-14 17:30:49.461811
\.


--
-- Data for Name: balance_topup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.balance_topup (id, user_id, amount, method, account_name, status, requested_at, processed_at) FROM stdin;
\.


--
-- Data for Name: business_leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_leads (id, company_name, contact_name, email, phone, website, product_count, message, created_at) FROM stdin;
\.


--
-- Data for Name: champion_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.champion_history (id, user_id, year_month, final_rank, total_points, earnings, created_at) FROM stdin;
\.


--
-- Data for Name: collection_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collection_items (id, collection_id, product_id, sort_order, added_at) FROM stdin;
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collections (id, user_id, title, slug, description, is_public, view_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaints (id, reporter_user_id, target_type, target_id, reason, description, status, resolved_by_user_id, resolved_at, action_taken, created_at) FROM stdin;
\.


--
-- Data for Name: game_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_scores (id, player_name, product_id, guessed_price, actual_price, score, created_at) FROM stdin;
\.


--
-- Data for Name: monthly_pool; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monthly_pool (id, year_month, affiliate_revenue, ad_revenue, subscription_revenue, total_revenue, pool_percent, pool_amount, total_unique_clicks, price_per_click, status, calculated_at, created_at, registration_reward_pool) FROM stdin;
1	2026-03	0	0	0	0	30	500	0	0	active	\N	2026-03-14 16:29:21.852139	0
2	202603	0	0	0	0	30	10000	0	0	active	\N	2026-03-15 00:59:35.007134	0
\.


--
-- Data for Name: page_owner_revenue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.page_owner_revenue (id, product_id, owner_id, year_month, page_views, estimated_revenue, paid_out, created_at) FROM stdin;
\.


--
-- Data for Name: point_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.point_events (id, user_id, type, points, description, reference_id, created_at) FROM stdin;
1	1	game	8	Oyun turu	game-test-1	2026-03-14 15:56:17.258058
1730	9	affiliate_click	5	Mağaza ziyareti: Trendyol	click-clicker-42-user-9-2026-03-14	2026-03-14 23:38:44.739145
1732	1	new_follower	5	King06 seni takip etmeye başladı	follow-9-1	2026-03-15 00:30:53.532719
4	1	affiliate_click	5	Mağaza ziyareti: Trendyol	affiliate-clicker-1-1-2026-03-14	2026-03-14 16:31:17.227408
5	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	affiliate-33-web-1773522219777-t542oq4dnj-2026-03-14	2026-03-14 21:03:40.784538
6	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	affiliate-33-web-1773522224427-b2u53q60c9-2026-03-14	2026-03-14 21:03:45.159474
7	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	affiliate-33-web-1773522227115-aigoqcudwz-2026-03-14	2026-03-14 21:03:48.000591
8	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	affiliate-33-web-1773522250840-e395qofig2k-2026-03-14	2026-03-14 21:04:11.804991
9	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	affiliate-33-web-1773522255298-5v28loznyoi-2026-03-14	2026-03-14 21:04:16.007638
10	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	affiliate-33-web-1773522256649-366usinp039-2026-03-14	2026-03-14 21:04:16.969362
11	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	affiliate-33-web-1773522329577-6pv616czwtb-2026-03-14	2026-03-14 21:05:30.483313
12	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	affiliate-33-web-1773522333318-owost27ffis-2026-03-14	2026-03-14 21:05:34.008636
13	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	click-creator-33-ip-eff8e7ca506627fe-2026-03-14	2026-03-14 21:11:58.655773
14	9	product_click_earned	5	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " ürününe tıklama	click-creator-33-ip-81b9e50d9a6130a0-2026-03-14	2026-03-14 22:13:32.10295
15	21	product_click_earned	5	"adidas Originals JI4461 Campus 00s Shoes" ürününe tıklama	click-creator-45-ip-81b9e50d9a6130a0-2026-03-14	2026-03-14 22:48:10.069502
16	21	product_click_earned	5	"HE1000 Full Size Open Back Nanometer Aud" ürününe tıklama	click-creator-44-ip-81b9e50d9a6130a0-2026-03-14	2026-03-14 22:48:13.037553
17	21	product_click_earned	5	"Reusch - Thunder R-Tex XT Softshell Kaya" ürününe tıklama	click-creator-42-ip-81b9e50d9a6130a0-2026-03-14	2026-03-14 22:48:15.798702
18	21	product_click_earned	5	"Hifiman HE1000 Unveiled Kulaklık" ürününe tıklama	click-creator-43-ip-81b9e50d9a6130a0-2026-03-14	2026-03-14 22:48:17.166449
19	21	affiliate_click	5	Mağaza ziyareti: ty.gl	click-clicker-33-user-21-2026-03-14	2026-03-14 22:48:27.637017
1733	5	new_follower	5	King06 seni takip etmeye başladı	follow-9-5	2026-03-15 00:31:01.240223
1734	9	product_click_earned	10	"Apple Watch SE 3 GPS, 40mm Yıldız Işığı " — dış tıklama (2x puan)	click-creator-33-ip-81b9e50d9a6130a0-2026-03-15	2026-03-15 00:31:09.711441
1736	2	new_follower	5	King06 seni takip etmeye başladı	follow-9-2	2026-03-15 01:41:41.728467
1737	472	new_follower	5	King06 seni takip etmeye başladı	follow-9-472	2026-03-15 01:41:45.040279
1738	10	new_follower	5	King06 seni takip etmeye başladı	follow-9-10	2026-03-15 01:41:57.311381
1739	9	product_click_earned	10	"Reusch - Thunder R-Tex XT Softshell Kaya" — dış tıklama (2x puan)	click-creator-1248-ip-81b9e50d9a6130a0-2026-03-15	2026-03-15 03:17:31.108657
1740	9	product_click_earned	10	"Avon Incandessence Kadın Parfüm Edp 50 M" — dış tıklama (2x puan)	click-creator-1249-ip-81b9e50d9a6130a0-2026-03-15	2026-03-15 03:17:35.051453
28	21	product_click_earned	5	"Reusch - Thunder R-Tex XT Softshell Kaya" ürününe tıklama	click-creator-42-user-75-2026-03-14	2026-03-14 22:48:30.634198
36	21	product_click_earned	5	"Hifiman HE1000 Unveiled Kulaklık" ürününe tıklama	click-creator-43-user-72-2026-03-14	2026-03-14 22:48:31.558406
37	21	product_click_earned	5	"HE1000 Full Size Open Back Nanometer Aud" ürününe tıklama	click-creator-44-user-76-2026-03-14	2026-03-14 22:48:31.690561
38	21	product_click_earned	5	"Reusch - Thunder R-Tex XT Softshell Kaya" ürününe tıklama	click-creator-42-user-74-2026-03-14	2026-03-14 22:48:31.771479
39	21	product_click_earned	5	"Reusch - Thunder R-Tex XT Softshell Kaya" ürününe tıklama	click-creator-42-user-76-2026-03-14	2026-03-14 22:48:32.207274
55	21	product_click_earned	5	"adidas Originals JI4461 Campus 00s Shoes" ürününe tıklama	click-creator-45-user-77-2026-03-14	2026-03-14 22:48:34.647708
1731	21	product_click_earned	5	"Reusch - Thunder R-Tex XT Softshell Kaya" ürününe tıklama	click-creator-42-ip-eff8e7ca506627fe-2026-03-15	2026-03-15 00:17:25.226056
1735	21	product_click_earned	10	"HE1000 Full Size Open Back Nanometer Aud" — dış tıklama (2x puan)	click-creator-44-ip-81b9e50d9a6130a0-2026-03-15	2026-03-15 01:28:12.832374
1741	9	new_follower	5	King seni takip etmeye başladı	follow-8-9	2026-03-15 03:32:53.694646
\.


--
-- Data for Name: price_alarms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_alarms (id, product_id, email, target_price, token, is_active, triggered_at, created_at) FROM stdin;
1	1	test@example.com	49999	59d4300e15419c3378c052c100505afbb47cb77bb2f579e2	f	\N	2026-03-14 11:23:34.973287
2	1	alarm-test@example.com	49499	21762bc27f855654bbaf8bdac40d0ccd2dd4710a094a6a4c	f	\N	2026-03-14 11:25:35.384436
\.


--
-- Data for Name: prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prices (id, product_id, price, note, recorded_at) FROM stdin;
1	1	54999	İlk fiyat	2025-12-14 03:23:11.535
2	1	54999	\N	2025-12-29 03:23:11.535
3	1	52999	\N	2026-01-13 03:23:11.535
4	1	54999	Fiyat artışı	2026-01-28 03:23:11.535
5	1	54999	\N	2026-02-12 03:23:11.535
6	1	54999	\N	2026-02-22 03:23:11.535
7	1	56999	"İndirim öncesi" fiyat artışı	2026-02-28 03:23:11.535
8	1	54999	Büyük Kampanya - SAHTE!	2026-03-07 03:23:11.535
9	1	54999	\N	2026-03-11 03:23:11.535
10	1	54999	\N	2026-03-14 03:23:11.535
11	2	62000	İlk fiyat	2025-11-14 03:23:11.535
12	2	60000	İndirim	2025-12-04 03:23:11.535
13	2	58000	Devam eden indirim	2025-12-24 03:23:11.535
14	2	56000	\N	2026-01-13 03:23:11.535
15	2	54000	\N	2026-02-02 03:23:11.535
16	2	52000	\N	2026-02-22 03:23:11.535
17	2	50000	\N	2026-03-04 03:23:11.535
18	2	48000	\N	2026-03-09 03:23:11.535
19	2	46500	En düşük fiyat!	2026-03-14 03:23:11.535
20	3	8999	İlk fiyat	2025-09-15 03:23:11.535
21	3	8999	\N	2025-10-15 03:23:11.535
22	3	9499	Fiyat artışı	2025-11-14 03:23:11.535
23	3	9499	\N	2025-12-14 03:23:11.535
24	3	9999	İndirim öncesi yükseltme	2026-01-13 03:23:11.535
25	3	9999	\N	2026-01-28 03:23:11.535
26	3	9999	\N	2026-02-12 03:23:11.535
27	3	7999	"50% indirim!" Sahte!	2026-02-28 03:23:11.535
28	3	7999	\N	2026-03-07 03:23:11.535
29	3	7999	\N	2026-03-14 03:23:11.535
30	4	4999	İlk fiyat	2025-12-14 03:23:11.535
31	4	4999	\N	2026-01-03 03:23:11.535
32	4	4499	Sezon sonu indirim	2026-01-23 03:23:11.535
33	4	3999	İndirim devam ediyor	2026-02-12 03:23:11.535
34	4	3499	\N	2026-02-28 03:23:11.535
35	4	2999	En düşük! Gerçek indirim	2026-03-07 03:23:11.535
36	4	2999	\N	2026-03-14 03:23:11.535
37	5	21999	İlk fiyat	2025-10-15 03:23:11.535
38	5	22999	Fiyat artışı	2025-11-14 03:23:11.535
39	5	24999	Yüksek sezon	2025-12-14 03:23:11.535
40	5	24999	\N	2026-01-13 03:23:11.535
41	5	26999	Kampanya öncesi artış	2026-02-12 03:23:11.535
42	5	21999	Efsane Cuma kampanyası! SAHTE!	2026-02-27 03:23:11.535
43	5	21999	\N	2026-03-09 03:23:11.535
44	5	21999	\N	2026-03-14 03:23:11.535
45	6	89999	İlk fiyat	2025-08-26 03:23:11.535
46	6	89999	\N	2025-10-05 03:23:11.535
47	6	92999	Döviz artışı	2025-11-14 03:23:11.535
48	6	87999	İndirim	2025-12-24 03:23:11.535
49	6	84999	\N	2026-02-02 03:23:11.535
50	6	82999	\N	2026-02-22 03:23:11.535
51	6	79999	Gerçek indirim!	2026-03-04 03:23:11.535
52	6	79999	\N	2026-03-14 03:23:11.535
53	7	4999	İlk fiyat	2026-01-13 03:23:11.535
54	7	5499	\N	2026-01-23 03:23:11.535
55	7	5499	\N	2026-02-02 03:23:11.535
56	7	5999	Kampanya öncesi artış	2026-02-12 03:23:11.535
57	7	5999	\N	2026-02-22 03:23:11.535
58	7	3999	"Yarı fiyatına!" - SAHTE!	2026-03-04 03:23:11.535
59	7	3999	\N	2026-03-11 03:23:11.535
60	7	3999	\N	2026-03-14 03:23:11.535
61	8	2499	İlk fiyat	2025-12-14 03:23:11.535
62	8	2299	Sezon indirim	2025-12-29 03:23:11.535
63	8	2099	\N	2026-01-13 03:23:11.535
64	8	1899	Düşüş devam ediyor	2026-01-28 03:23:11.535
65	8	1699	\N	2026-02-12 03:23:11.535
66	8	1499	Gerçek indirim!	2026-02-28 03:23:11.535
67	8	1499	\N	2026-03-14 03:23:11.535
68	9	4999.99	\N	2026-03-14 03:55:24.283998
69	10	175025	\N	2026-03-14 04:17:30.602725
75	11	2309.48	\N	2026-03-14 04:46:36.062091
113	12	54999	\N	2026-03-14 11:32:03.939668
114	13	1189	\N	2026-03-14 11:33:33.58075
115	14	1781.01	\N	2026-03-14 12:30:25.557817
116	15	9667.54	\N	2026-03-14 12:31:37.681274
117	16	374.4	\N	2026-03-14 12:32:36.693349
118	17	959.99	\N	2026-03-14 12:33:51.178374
119	18	1999	\N	2026-03-14 12:55:48.335591
120	19	3949	\N	2026-03-14 12:58:06.906385
121	20	7199	\N	2026-03-14 12:58:50.001648
122	21	3499	\N	2026-03-14 12:59:45.522596
123	22	3499	\N	2026-03-14 13:11:31.301851
124	23	74092.19	\N	2026-03-14 13:20:12.141705
125	24	9199	\N	2026-03-14 13:36:08.451699
126	25	14230	\N	2026-03-14 14:42:02.658158
127	8	31.78	Otomatik güncelleme	2026-03-14 17:58:12.737552
128	8	12.7	Otomatik güncelleme	2026-03-14 19:09:08.410316
129	26	2486.0723	\N	2026-03-14 20:16:44.95291
131	26	2482.89	Otomatik güncelleme	2026-03-14 21:02:11.475427
132	8	26	Otomatik güncelleme	2026-03-14 21:12:29.870898
139	8	49.99	Otomatik güncelleme	2026-03-14 21:52:04.84419
140	42	4190	\N	2026-03-14 22:41:10.285503
141	43	0	\N	2026-03-14 22:43:21.629024
142	8	26	Otomatik güncelleme	2026-03-14 22:44:00.060092
143	44	0	\N	2026-03-14 22:44:01.795479
144	45	0	\N	2026-03-14 22:45:29.467078
145	8	49.99	Otomatik güncelleme	2026-03-14 23:08:48.728717
146	1246	99	\N	2026-03-14 23:36:38.964757
148	8	68	Otomatik güncelleme	2026-03-14 23:37:35.650334
149	8	208	Otomatik güncelleme	2026-03-15 00:01:04.641229
150	8	245.42	Otomatik güncelleme	2026-03-15 00:21:49.372116
151	15	9799	Otomatik güncelleme	2026-03-15 01:05:29.80222
152	1248	4190	\N	2026-03-15 01:09:30.780575
153	1249	404.01	\N	2026-03-15 01:40:30.518972
154	1250	3499	\N	2026-03-15 03:32:06.911383
155	1249	467.9	Otomatik güncelleme	2026-03-15 03:49:48.380893
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, brand, category, description, image_url, store, store_url, original_price, created_at, last_offers_json, official_price, official_store_url, official_store_name, created_by_user_id, affiliate_click_count) FROM stdin;
1250	Duramo Speed 2 W Kadın Siyah Koşu Ayakkabısı IH8211		Genel	\N	https://0990b9.a-cdn.akinoncloud.com/products/2025/01/17/5886076/e5ba9a4d-12c6-4b94-b0f3-67e8c0b768f4.jpg	sportive.com.tr	https://www.sportive.com.tr/adidas-duramo-speed-2-w-kadin-siyah-kosu-ayakkabisi-ih8211-5/	3499	2026-03-15 03:32:06.877679	\N	\N	\N	\N	8	0
1246	Test Ürün Sil		Genel	\N	https://example.com/img.jpg	Diğer	https://example.com	99	2026-03-14 23:36:38.961584	\N	\N	\N	\N	\N	0
7	Philips Airfryer XXL HD9650	Philips	Ev Aletleri	Philips Airfryer XXL 7.3L Dijitalli Sıcak Hava Fritözü	https://images.unsplash.com/photo-1585515320310-259814833e62?w=400	MediaMarkt	https://mediamarkt.com.tr	4999	2026-03-14 03:23:11.768276	\N	\N	\N	\N	\N	30
16	UYDEE Dik Duruş Korsesi Medikal Bel Korsesi Bugün Fiyatı Düşenler Kamburluk Önleyici Korsesi	UYDEE	Genel	\N	https://cdn.dsmcdn.com/ty1813/prod/QC_PREP/20260116/15/29ea4088-7b47-3321-9d10-4f29c2b65b8d/1_org_zoom.jpg	ty.gl	https://ty.gl/ocli2xmlpdpbq	374.4	2026-03-14 12:32:36.690043	\N	\N	\N	\N	\N	26
5	Dyson V15 Detect Elektrikli Süpürge	Dyson	Ev Aletleri	Dyson V15 Detect Cordless Vacuum Cleaner	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400	Trendyol	https://trendyol.com	21999	2026-03-14 03:23:11.711212	\N	\N	\N	\N	\N	42
649	Philips Airfryer XL 2000W	Philips	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg	Hepsiburada	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	2499	2026-03-14 22:59:15.195019	\N	\N	\N	\N	326	6
13	Kurtuluş Çanta Kutuluş Çanta Çok Cepli Bayan Kol Çantası - Fiyatı, Yorumları	Bilinmeyen	Genel	\N	https://cdn.dsmcdn.com/ty82/product/media/images/20210310/10/70397170/151020437/1/1_org_zoom.jpg	ty.gl	https://ty.gl/uyto9e8wbnum6	1189	2026-03-14 11:33:33.576812	\N	\N	\N	\N	\N	39
2	Samsung Galaxy S24 Ultra 512GB	Samsung	Telefon	Samsung Galaxy S24 Ultra 512GB Titanyum Gri	https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400	Hepsiburada	https://hepsiburada.com	62000	2026-03-14 03:23:11.628747	\N	\N	\N	\N	\N	28
14	OLEVS ÇELİK SU GEÇİRMEZ  ÇİFT RENK KASA  GOLD  DETAYLI ŞIK SPOR  YENİ MODEL	OLEVS	Genel	\N	https://cdn.dsmcdn.com/ty1593/prod/QC/20241025/10/02698d49-cd4a-3fc3-9d6c-6c0a32dd9f71/1_org_zoom.jpg	ty.gl	https://ty.gl/l9hjj83ounver	1781.01	2026-03-14 12:30:25.145428	\N	\N	\N	\N	\N	38
12	Apple iPhone 17e 256GB Siyah - Fiyatı, Yorumları	Bilinmeyen	Genel	\N	https://cdn.dsmcdn.com/ty1000331/product/media/images/prod/PIM/20260304/01/c9fde5e4-0e21-4439-815c-32cf4c038bf7/1_org_zoom.jpg	ty.gl	https://ty.gl/2ebhv4p6wuagx	54999	2026-03-14 11:32:03.934885	\N	\N	\N	\N	\N	38
19	Adidas IH7758 RUNFALCON 5 Siyah Erkek Koşu Ayakkabısı	Adidas	Genel	\N	https://statics-mp.boyner.com.tr/mnresize/97/135/Boynerimages/5003165480_001_01.jpg?v=1747746862	Boyner	https://www.boyner.com.tr/adidas-ih7758-runfalcon-5-siyah-erkek-kosu-ayakkabisi-p-15222953	3949	2026-03-14 12:58:06.874609	\N	\N	\N	\N	\N	31
18	adidas Hoops 3.0 Mid Lifestyle Basketball Low Ayakkabı - Fiyatı, Yorumları	Bilinmeyen	Genel	\N	https://cdn.dsmcdn.com/ty1552/prod/QC/20240917/08/e525d59f-5f04-33ae-b972-dba9addf5bbc/1_org_zoom.jpg	ty.gl	https://ty.gl/7mlv9fyjev2zb	1999	2026-03-14 12:55:48.053038	\N	\N	\N	\N	\N	39
650	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	3499	2026-03-14 22:59:15.197668	\N	\N	\N	\N	325	6
8	Levi's 501 Original Straight Jeans	Levi's	Giyim	Levi's 501 Original Straight Erkek Kot Pantolon - Koyu Mavi	https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400	Trendyol	https://trendyol.com	2499	2026-03-14 03:23:11.791297	\N	\N	\N	\N	\N	35
646	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	3299	2026-03-14 22:59:15.186148	\N	\N	\N	\N	323	5
3	Sony WH-1000XM5 Kablosuz Kulaklık	Sony	Ses Ekipmanları	Sony WH-1000XM5 Gürültü Önleyici Kablosuz Kulaklık - Siyah	https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400	Amazon Türkiye	https://amazon.com.tr	8999	2026-03-14 03:23:11.657225	\N	\N	\N	\N	\N	48
651	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	3499	2026-03-14 22:59:15.199857	\N	\N	\N	\N	323	4
648	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	3299	2026-03-14 22:59:15.192447	\N	\N	\N	\N	322	4
647	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	18999	2026-03-14 22:59:15.189223	\N	\N	\N	\N	324	6
23	Milenyum 10 gr 22 Ayar Ajda Bilezik | Mücevher	Milenyum	Genel	\N	https://cdn.dsmcdn.com/ty1598/prod/QC/20241105/14/0fd86b97-4aa0-356c-b8a7-08af66b5b642/1_org_zoom.jpg	ty.gl	https://ty.gl/ttjt1u6qn0dmq	74092.19	2026-03-14 13:20:12.109207	\N	\N	\N	\N	\N	32
17	Koton Rahat Kalıp Klasik Yaka Cepli Düğmeli Crop Bomber Ceket	Koton	Genel	\N	https://cdn.dsmcdn.com/ty1823/prod/QC_ENRICHMENT/20260207/06/bc42e599-08fa-32a1-9f56-4f7f1ea6ab22/1_org_zoom.jpg	ty.gl	https://ty.gl/vptovxlkd8sa8	959.99	2026-03-14 12:33:51.173461	\N	\N	\N	\N	\N	45
25	Samsung Galaxy A26 SM-A266BZWCTUR 5G 256 GB Akıllı Telefon Beyaz (Samsung Türkiye Garantili)	Samsung	Genel	\N	https://cdn.dsmcdn.com/ty1811/prod/QC_PREP/20260108/15/51e096e3-ef88-34ed-a6a2-26b2e38b82a9/1_org_zoom.jpg	ty.gl	https://ty.gl/6n46k5wxs5hs5	14230	2026-03-14 14:42:02.620118	\N	\N	\N	\N	\N	37
24	Xiaomi Redmi 15C 8GB RAM 256GB ROM, Siyah(Xiaomi Türkiye Garantili)	Xiaomi	Genel	\N	https://cdn.dsmcdn.com/ty1733/prod/QC_PREP/20250822/09/e18036c1-8045-33db-b2ef-bd11952d6d04/1_org_zoom.jpg	ty.gl	https://ty.gl/ibhiz6l5ky84n	9199	2026-03-14 13:36:08.280908	\N	\N	\N	\N	\N	25
4	Nike Air Max 270	Nike	Spor & Outdoor	Nike Air Max 270 Erkek Yürüyüş Ayakkabısı - Beyaz/Siyah	https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400	Nike TR	https://nike.com/tr	4999	2026-03-14 03:23:11.687832	\N	\N	\N	\N	\N	31
45	adidas Originals JI4461 Campus 00s Shoes		Genel	\N	\N	Hepsiburada	https://www.hepsiburada.com/adidas-originals-ji4461-campus-00s-shoes-p-HBCV00008QE25U	0	2026-03-14 22:45:29.453153	\N	\N	\N	\N	21	32
10	Plus Scorpion Erkek Kolu Yamalı Blazer Ceket – Bebe Mavi Renk, İtalyan Kesim Şık ve Modern Tasarım	Plus Scorpion	Giysi 	Plus Scorpion Erkek Kolu Yamalı Blazer Ceket – Bebe Mavi Renk, İtalyan Kesim Şık ve Modern Tasarım yorumlarını inceleyin, Trendyol'a özel indirimli fiyata satın alın.	https://ty.gl/e2dd5px4ayksd	ty.gl	https://ty.gl/e2dd5px4ayksd	175025	2026-03-14 04:17:30.323229	\N	\N	\N	\N	\N	29
1248	Reusch - Thunder R-Tex XT Softshell Kayak & Snowboard Eldiveni	Reusch	Genel	\N	https://cdn.dsmcdn.com/ty1771/prod/QC_ENRICHMENT/20251012/22/456c8b73-15e0-34c4-811f-50b03ebb80e9/1_org_zoom.jpg	ty.gl	https://ty.gl/z8q0s2ekqym1n	4190	2026-03-15 01:09:30.776991	\N	\N	\N	\N	9	2
665	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461	12999	2026-03-14 22:59:15.737223	\N	\N	\N	\N	331	0
666	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461	18999	2026-03-14 22:59:15.74004	\N	\N	\N	\N	327	4
656	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	18999	2026-03-14 22:59:15.21246	\N	\N	\N	\N	323	4
664	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742	1899	2026-03-14 22:59:15.735013	\N	\N	\N	\N	329	2
652	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	3499	2026-03-14 22:59:15.202442	\N	\N	\N	\N	324	6
662	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/samsung/galaxy-buds2-pro-p-450272555	18999	2026-03-14 22:59:15.729491	\N	\N	\N	\N	330	2
663	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	2799	2026-03-14 22:59:15.732174	\N	\N	\N	\N	328	5
667	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/samsung/galaxy-buds2-pro-p-450272555	1899	2026-03-14 22:59:15.742358	\N	\N	\N	\N	330	5
1	iPhone 15 Pro 256GB	Apple	Telefon	Apple iPhone 15 Pro 256GB Doğal Titanyum	https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400	Trendyol	https://trendyol.com	54999	2026-03-14 03:23:11.569602	\N	59999	https://www.apple.com/tr/shop/buy-iphone/iphone-15-pro	Apple Türkiye	\N	38
20	adidas IG9031 SAMBA OG W Siyah Kadın Lifestyle Ayakkabı	Adidas	Genel	\N	https://statics-mp.boyner.com.tr/mnresize/900/1254/Boynerimages/5003165570_001_01.jpg?v=1745227228	Boyner	https://www.boyner.com.tr/adidas-ig9031-samba-og-w-siyah-kadin-lifestyle-ayakkabi-p-15067759	7199	2026-03-14 12:58:49.998002	\N	\N	\N	\N	\N	30
655	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	4299	2026-03-14 22:59:15.209757	\N	\N	\N	\N	325	3
21	COURT BOROUGH LOW RECRAFT Beyaz Unisex Sneaker	Nike	Genel	\N	https://floimages.mncdn.com/media/catalog/product/23-06/22/101792764_d2.jpeg	flo.com.tr	https://www.flo.com.tr/urun/nike-court-borough-low-recraft-beyaz-unisex-sneaker-101792764	3499	2026-03-14 12:59:45.519256	\N	\N	\N	\N	\N	37
654	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	18999	2026-03-14 22:59:15.207388	\N	\N	\N	\N	326	3
653	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	12999	2026-03-14 22:59:15.204965	\N	\N	\N	\N	322	4
659	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	1899	2026-03-14 22:59:15.219658	\N	\N	\N	\N	326	5
657	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	3299	2026-03-14 22:59:15.214633	\N	\N	\N	\N	324	3
658	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	1899	2026-03-14 22:59:15.217116	\N	\N	\N	\N	322	6
660	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	12999	2026-03-14 22:59:15.222177	\N	\N	\N	\N	325	5
1249	Avon Incandessence Kadın Parfüm Edp 50 Ml.	Avon	Genel	\N	https://cdn.dsmcdn.com/ty1816/prod/QC_ENRICHMENT/20260123/16/21416aa2-67a9-36dc-820d-5b67e95b0321/1_org_zoom.jpg	ty.gl	https://ty.gl/mxwbu30gltd7i	404.01	2026-03-15 01:40:30.486733	\N	\N	\N	\N	9	1
670	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461	1899	2026-03-14 22:59:15.750131	\N	\N	\N	\N	331	2
674	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742	18999	2026-03-14 22:59:15.760419	\N	\N	\N	\N	329	2
684	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	12999	2026-03-14 22:59:16.28527	\N	\N	\N	\N	336	3
672	Philips Airfryer XL 2000W	Philips	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg	Hepsiburada	https://www.trendyol.com/samsung/galaxy-buds2-pro-p-450272555	2499	2026-03-14 22:59:15.755945	\N	\N	\N	\N	330	1
691	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	4299	2026-03-14 22:59:16.802762	\N	\N	\N	\N	340	3
695	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.trendyol.com/samsung/galaxy-buds2-pro-p-450272555	2799	2026-03-14 22:59:16.813402	\N	\N	\N	\N	337	1
689	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	3299	2026-03-14 22:59:16.29712	\N	\N	\N	\N	336	4
669	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742	4299	2026-03-14 22:59:15.747509	\N	\N	\N	\N	329	3
685	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	12999	2026-03-14 22:59:16.287674	\N	\N	\N	\N	334	4
681	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	18999	2026-03-14 22:59:16.278482	\N	\N	\N	\N	335	4
682	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	2799	2026-03-14 22:59:16.280637	\N	\N	\N	\N	333	2
688	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	18999	2026-03-14 22:59:16.294765	\N	\N	\N	\N	332	3
692	Philips Airfryer XL 2000W	Philips	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg	Hepsiburada	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	2499	2026-03-14 22:59:16.805742	\N	\N	\N	\N	338	3
683	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	2799	2026-03-14 22:59:16.282854	\N	\N	\N	\N	332	5
697	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	1899	2026-03-14 22:59:16.818068	\N	\N	\N	\N	338	1
673	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	4299	2026-03-14 22:59:15.757975	\N	\N	\N	\N	328	5
676	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	3499	2026-03-14 22:59:16.26626	\N	\N	\N	\N	335	4
696	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	12999	2026-03-14 22:59:16.815644	\N	\N	\N	\N	340	2
677	Philips Airfryer XL 2000W	Philips	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg	Hepsiburada	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	2499	2026-03-14 22:59:16.26907	\N	\N	\N	\N	333	2
690	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	18999	2026-03-14 22:59:16.299533	\N	\N	\N	\N	334	2
678	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	3499	2026-03-14 22:59:16.271557	\N	\N	\N	\N	332	2
693	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	18999	2026-03-14 22:59:16.808485	\N	\N	\N	\N	341	5
698	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	12999	2026-03-14 22:59:16.820302	\N	\N	\N	\N	341	3
686	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	3299	2026-03-14 22:59:16.29072	\N	\N	\N	\N	335	2
694	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742	18999	2026-03-14 22:59:16.811241	\N	\N	\N	\N	339	3
713	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	12999	2026-03-14 22:59:17.35553	\N	\N	\N	\N	345	0
717	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696	18999	2026-03-14 22:59:17.365008	\N	\N	\N	\N	342	0
714	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	3299	2026-03-14 22:59:17.357597	\N	\N	\N	\N	346	5
726	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696	12999	2026-03-14 22:59:17.889666	\N	\N	\N	\N	347	4
706	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	2799	2026-03-14 22:59:17.339204	\N	\N	\N	\N	344	3
716	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	18999	2026-03-14 22:59:17.362778	\N	\N	\N	\N	344	4
710	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696	3499	2026-03-14 22:59:17.348966	\N	\N	\N	\N	343	4
725	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	3499	2026-03-14 22:59:17.887038	\N	\N	\N	\N	349	2
699	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742	3299	2026-03-14 22:59:16.822749	\N	\N	\N	\N	339	3
711	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	1899	2026-03-14 22:59:17.351297	\N	\N	\N	\N	344	4
707	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696	3299	2026-03-14 22:59:17.342133	\N	\N	\N	\N	342	5
709	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	4299	2026-03-14 22:59:17.34674	\N	\N	\N	\N	346	4
700	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/samsung/galaxy-buds2-pro-p-450272555	3299	2026-03-14 22:59:16.824982	\N	\N	\N	\N	337	1
720	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696	18999	2026-03-14 22:59:17.372818	\N	\N	\N	\N	343	5
705	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/samsung/galaxy-buds2-pro-p-450272555	12999	2026-03-14 22:59:16.836164	\N	\N	\N	\N	337	1
724	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461	4299	2026-03-14 22:59:17.884679	\N	\N	\N	\N	348	1
718	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	3499	2026-03-14 22:59:17.367415	\N	\N	\N	\N	345	4
722	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	4299	2026-03-14 22:59:17.879632	\N	\N	\N	\N	351	3
723	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	3299	2026-03-14 22:59:17.882112	\N	\N	\N	\N	350	1
728	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	12999	2026-03-14 22:59:17.894025	\N	\N	\N	\N	350	4
702	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	3299	2026-03-14 22:59:16.829984	\N	\N	\N	\N	338	3
704	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742	12999	2026-03-14 22:59:16.83425	\N	\N	\N	\N	339	5
703	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	3299	2026-03-14 22:59:16.832167	\N	\N	\N	\N	341	2
719	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	2799	2026-03-14 22:59:17.370217	\N	\N	\N	\N	346	1
727	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	3499	2026-03-14 22:59:17.891561	\N	\N	\N	\N	351	4
721	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696	4299	2026-03-14 22:59:17.876513	\N	\N	\N	\N	347	1
729	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461	12999	2026-03-14 22:59:17.896321	\N	\N	\N	\N	348	0
742	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	18999	2026-03-14 22:59:18.429195	\N	\N	\N	\N	352	0
754	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	18999	2026-03-14 22:59:18.958541	\N	\N	\N	\N	359	3
734	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461	2799	2026-03-14 22:59:17.908056	\N	\N	\N	\N	348	2
757	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	1899	2026-03-14 22:59:18.965538	\N	\N	\N	\N	361	2
747	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	1899	2026-03-14 22:59:18.441218	\N	\N	\N	\N	352	5
750	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	3299	2026-03-14 22:59:18.447753	\N	\N	\N	\N	354	1
746	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	12999	2026-03-14 22:59:18.438679	\N	\N	\N	\N	356	3
738	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	18999	2026-03-14 22:59:18.419448	\N	\N	\N	\N	353	3
753	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	3499	2026-03-14 22:59:18.955879	\N	\N	\N	\N	357	2
735	Philips Airfryer XL 2000W	Philips	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg	Hepsiburada	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	2499	2026-03-14 22:59:17.910076	\N	\N	\N	\N	349	1
740	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	18999	2026-03-14 22:59:18.424115	\N	\N	\N	\N	354	6
732	Philips Airfryer XL 2000W	Philips	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg	Hepsiburada	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	2499	2026-03-14 22:59:17.903599	\N	\N	\N	\N	351	3
730	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	1899	2026-03-14 22:59:17.898955	\N	\N	\N	\N	349	3
755	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	4299	2026-03-14 22:59:18.961047	\N	\N	\N	\N	360	1
739	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742	12999	2026-03-14 22:59:18.421601	\N	\N	\N	\N	355	3
743	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	2799	2026-03-14 22:59:18.431655	\N	\N	\N	\N	353	2
733	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	1899	2026-03-14 22:59:17.905723	\N	\N	\N	\N	350	3
749	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742	4299	2026-03-14 22:59:18.445394	\N	\N	\N	\N	355	4
736	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	1899	2026-03-14 22:59:18.413607	\N	\N	\N	\N	356	1
756	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	3499	2026-03-14 22:59:18.963131	\N	\N	\N	\N	358	1
744	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/philips/airfryer-xl-2000w-p-68729742	3499	2026-03-14 22:59:18.434515	\N	\N	\N	\N	355	2
741	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	4299	2026-03-14 22:59:18.426586	\N	\N	\N	\N	356	2
751	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	3299	2026-03-14 22:59:18.950787	\N	\N	\N	\N	358	3
748	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	3299	2026-03-14 22:59:18.443373	\N	\N	\N	\N	353	2
731	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696	3499	2026-03-14 22:59:17.901165	\N	\N	\N	\N	347	2
758	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	4299	2026-03-14 22:59:18.967958	\N	\N	\N	\N	357	2
745	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	2799	2026-03-14 22:59:18.436631	\N	\N	\N	\N	354	1
761	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	1899	2026-03-14 22:59:18.974714	\N	\N	\N	\N	358	0
759	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	4299	2026-03-14 22:59:18.970034	\N	\N	\N	\N	359	2
764	Adidas Ultraboost 22	Adidas	Elektronik	\N	https://assets.adidas.com/images/w_600/abc.jpg	Adidas	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	2799	2026-03-14 22:59:18.981732	\N	\N	\N	\N	359	4
762	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	18999	2026-03-14 22:59:18.976886	\N	\N	\N	\N	361	2
763	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/adidas/ultraboost-22-kadin-spor-ayakkabi-p-236869525	3299	2026-03-14 22:59:18.97924	\N	\N	\N	\N	357	5
15	Samsung Galaxy A16 4 Gb Ram 128 Gb Gri	Samsung	Genel	\N	https://cdn.dsmcdn.com/ty1701/prod/QC_PREP/20250630/11/7d13f4da-a5d8-387e-a54a-81872248996f/1_org_zoom.jpg	ty.gl	https://ty.gl/iflr591zrdt55	9667.54	2026-03-14 12:31:37.647377	\N	\N	\N	\N	\N	39
26	White Stone Siyah Kadife Fitilli Casual Premium Ceket - Fiyatı, Yorumları	White stone 	Giysi 	Siyah Kadife Fitilli Casual Premium Ceket yorumlarını inceleyin, Trendyol'a özel indirimli fiyata satın alın. - Trendyol	https://cdn.dsmcdn.com/ty1813/prod/QC_PREP/20260116/15/262a1cb3-57d3-3627-8b22-891de82b27f8/1_org_zoom.jpg	ty.gl	https://ty.gl/joejf06cemk04	102486.07	2026-03-14 20:16:44.921725	\N	\N	\N	\N	\N	24
712	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696	12999	2026-03-14 22:59:17.353428	\N	\N	\N	\N	342	3
680	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	4299	2026-03-14 22:59:16.276488	\N	\N	\N	\N	334	5
675	Philips Airfryer XL 2000W	Philips	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg	Hepsiburada	https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461	2499	2026-03-14 22:59:15.763152	\N	\N	\N	\N	331	3
701	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	3299	2026-03-14 22:59:16.827452	\N	\N	\N	\N	340	5
737	Philips Airfryer XL 2000W	Philips	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg	Hepsiburada	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	2499	2026-03-14 22:59:18.416928	\N	\N	\N	\N	352	5
752	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.hepsiburada.com/logitech-mx-keys-mini-kablosuz-klavye-pm-HBC00000WKQAX	4299	2026-03-14 22:59:18.953696	\N	\N	\N	\N	361	3
765	Samsung Galaxy Buds2 Pro	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/def.jpg	Trendyol	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	3499	2026-03-14 22:59:18.984065	\N	\N	\N	\N	360	3
661	Nike Air Max 270	Nike	Elektronik	\N	https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/abc.jpg	Nike	https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461	3299	2026-03-14 22:59:15.72542	\N	\N	\N	\N	327	7
22	COURT BOROUGH LOW RECRAFT Beyaz Unisex Sneaker	Nike	Genel	\N	https://floimages.mncdn.com/media/catalog/product/23-06/22/101792764_d2.jpeg	flo.com.tr	https://www.flo.com.tr/urun/nike-court-borough-low-recraft-beyaz-unisex-sneaker-101792764	3499	2026-03-14 13:11:31.262884	\N	\N	\N	\N	\N	39
715	Philips Airfryer XL 2000W	Philips	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/abc.jpg	Hepsiburada	https://www.trendyol.com/dyson/v15-detect-absolute-kablosuz-supurge-p-247555696	2499	2026-03-14 22:59:17.360411	\N	\N	\N	\N	343	6
668	Samsung 55 4K Smart TV	Samsung	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/abc.jpg	Trendyol	https://www.trendyol.com/nike/air-max-270-erkek-spor-ayakkabi-p-119768038	12999	2026-03-14 22:59:15.745138	\N	\N	\N	\N	328	4
9	Test Ürünü Samsung TV 55 Inch	Samsung	Elektronik	\N	\N	Trendyol	\N	7999.99	2026-03-14 03:55:24.042349	\N	\N	\N	\N	\N	47
708	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	1899	2026-03-14 22:59:17.344487	\N	\N	\N	\N	345	2
671	Logitech MX Keys Mini Klavye	Logitech	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/ghi.jpg	Hepsiburada	https://www.trendyol.com/apple/watch-se-2-nesil-gps-40mm-gece-yarisi-aluminyum-kasa-gece-yarisi-spor-kordon-p-671892461	1899	2026-03-14 22:59:15.752587	\N	\N	\N	\N	327	8
6	MacBook Pro M3 14" 512GB	Apple	Bilgisayar	Apple MacBook Pro 14 inç M3 Çip 512GB SSD Uzay Grisi	https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400	Gittigidiyor	https://gittigidiyor.com	89999	2026-03-14 03:23:11.741738	\N	\N	\N	\N	\N	34
11	White Stone Açık Yeşil Fitilli Kadife Slim Fit Blazer Ceket	White Stone	Giysi 	White Stone Açık Yeşil Fitilli Kadife Slim Fit Blazer Ceket yorumlarını inceleyin, Trendyol'a özel indirimli fiyata satın alın.	https://cdn.dsmcdn.com/ty1827/prod/QC_PREP/20260217/11/a146cad4-f429-342b-ab43-a9fd079cc35e/1_org_zoom.jpg	ty.gl	https://ty.gl/meszfzvb431bp	2309.48	2026-03-14 04:46:35.751836	\N	\N	\N	\N	\N	28
44	HE1000 Full Size Open Back Nanometer Audiophiles	HE1000 Full Size Open Back Nanometer Audiophiles	Genel	\N	\N	Amazon Türkiye	https://www.amazon.com.tr/HE1000-Full-Size-Open-Back-Nanometer-Audiophiles/dp/B0DMW2S832?tag=trtxtgostdsp-21&hvadid=775282406069&hvpos=&hvexid=&hvnetw=g&hvrand=11904465759486956457&hvpone=&hvptwo=&hvqmt=&hvdev=m&hvdvcmdl=&hvlocint=&hvlocphy=9219787&hvtargid=dsa-2442300831728&ref=pd_sl_9hxqdd0iy5_b&gad_source=1&gad_campaignid=23038848649&gclid=CjwKCAjwjtTNBhB0EiwAuswYhgVca2V76_FJVqoFgCFet14kbmSvQMsqAkP6GUaEht3J5_CEhVFeGRoCR3cQAvD_BwE	0	2026-03-14 22:44:01.792121	\N	\N	\N	\N	21	44
687	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/apple/airpods-pro-2-nesil-p-631539073	4299	2026-03-14 22:59:16.29266	\N	\N	\N	\N	333	3
679	Apple Watch SE 2. Nesil	Apple	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/QC/20231027/15/d7dc0f24-89bb-3ebb-aba6-34e6a093deef/1_org_zoom.jpg	Trendyol	https://www.hepsiburada.com/samsung-galaxy-watch-6-classic-47mm-pm-HBC00000VQ9DG	4299	2026-03-14 22:59:16.273759	\N	\N	\N	\N	336	5
43	Hifiman HE1000 Unveiled Kulaklık	Hifiman	KULAKLIK	\N	\N	Diğer	https://www.amazon.com.tr/HE1000-Full-Size-Open-Back-Nanometer-Audiophiles/dp/B0DMW2S832?tag=trtxtgostdsp-21&hvadid=775282406069&hvpos=&hvexid=&hvnetw=g&hvrand=11904465759486956457&hvpone=&hvptwo=&hvqmt=&hvdev=m&hvdvcmdl=&hvlocint=&hvlocphy=9219787&hvtargid=dsa-2442300831728&ref=pd_sl_9hxqdd0iy5_b&gad_source=1&gad_campaignid=23038848649&gclid=CjwKCAjwjtTNBhB0EiwAuswYhgVca2V76_FJVqoFgCFet14kbmSvQMsqAkP6GUaEht3J5_CEhVFeGRoCR3cQAvD_BwE	0	2026-03-14 22:43:21.626022	\N	\N	\N	\N	21	40
42	Reusch - Thunder R-Tex XT Softshell Kayak & Snowboard Eldiveni	Reusch	Genel	\N	https://cdn.dsmcdn.com/ty1771/prod/QC_ENRICHMENT/20251012/22/456c8b73-15e0-34c4-811f-50b03ebb80e9/1_org_zoom.jpg	Trendyol	https://www.trendyol.com/reusch/thunder-r-tex-xt-softshell-kayak-snowboard-eldiveni-p-1803077	4190	2026-03-14 22:41:10.281063	\N	\N	\N	\N	21	52
760	Dyson V15 Detect Kablosuz Süpürge	Dyson	Elektronik	\N	https://cdn.dsmcdn.com/ty1073/product/media/images/prod/xyz.jpg	Trendyol	https://www.trendyol.com/samsung/55-4k-uhd-smart-led-tv-p-720527626	18999	2026-03-14 22:59:18.972202	\N	\N	\N	\N	360	4
\.


--
-- Data for Name: raffle_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.raffle_tickets (id, user_id, week_key, ticket_count, created_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, created_at) FROM stdin;
517	9	692c65a2c5f92ca762613aa5a3d3ee6872a575f80dfeb176d6c84afe34dadb61	2026-03-22 00:15:06.159	2026-03-15 00:15:06.291403
5	9	46a8270114b17d542912c9ff4d048329892b1b84f0bd245ed38d527d381f2bdd	2026-03-21 20:11:53.228	2026-03-14 20:11:53.229144
6	9	0f087655a88e764f53dfad27ebc68a24f34a09dd728f470f22fa1344f5b50c51	2026-03-21 20:14:53.1	2026-03-14 20:14:53.100819
7	9	eb76fb9a7a61bf91d54b52023d3ad748abfb0eb19d60a2e7136fe2c42f39e30e	2026-03-21 20:15:06.233	2026-03-14 20:15:06.233588
10	9	bb96e1adad82af1f6cbbcdad631311b31d93cf339b56e457eaab88d60b16ed1b	2026-03-21 21:01:27.027	2026-03-14 21:01:27.06905
533	9	5a132ca6b05a3d49748329b2c6fd5ac733a051d063fb4fdd92987bb15b56fb06	2026-03-22 01:39:23.979	2026-03-15 01:39:23.98368
12	9	0554d85c3b4bcb65da53dd5a942da15c7a5b4dd644081c993a65c44844786173	2026-03-21 21:04:27.329	2026-03-14 21:04:27.332983
535	9	68c69f73860a167d68efd7811011167ce71e1a1b85cda26e556c771ab1f71b26	2026-03-22 01:56:37.454	2026-03-15 01:56:37.494745
15	9	f930d3c99013e33daae3be359c8824c6fe9a51a530285737c4403e8e1fb7f95b	2026-03-21 21:05:58.712	2026-03-14 21:05:58.7477
17	9	da7a440ce56202ff7023b6bdf9320b3be95e85aa991f472767c054380da6beee	2026-03-21 21:13:19.95	2026-03-14 21:13:19.954223
20	9	0e59f52360e157ffbfa9eff67baba9bead4ad428800cf95b2ecc55177f2a52bb	2026-03-21 21:15:31.608	2026-03-14 21:15:31.639219
546	9	819c82332341bd0946a496b9b3c269820a2a1b4e686c4cff571a7fbbd3926c2a	2026-03-22 03:21:46.88	2026-03-15 03:21:46.9128
22	9	467d3f4dad2105537e38e98a5b215d19c191f029415a2994bb1e2536824c231c	2026-03-21 21:27:09.177	2026-03-14 21:27:09.181499
550	8	33ceb6a45180c94cc680b6ea0c343ae97714d56970f6215bf005ca19f2de9034	2026-03-22 03:26:15.827	2026-03-15 03:26:15.858347
24	9	3e971c199c6906940bc1ce68532e3a3f3cbedb58efa0bb3c181109be6cbf52b2	2026-03-21 21:28:00.248	2026-03-14 21:28:00.251807
26	9	69d03ed6575986625816f8b1e3456dac426d618ac7b5e3ddbb9983eefa93f608	2026-03-21 21:39:35.896	2026-03-14 21:39:35.929199
28	9	ccf5b9c6f31757e0a48f918dfca5e7be85e9f6711bbcbf5a1992bcc151c23c90	2026-03-21 21:55:45.838	2026-03-14 21:55:45.870943
562	9	97c757c7e587d123b2a885fb2cad3e10f5f1c4aee2490c6b6b838428736fe230	2026-03-22 03:59:22.135	2026-03-15 03:59:22.159018
32	9	e8bb09d967f342d75d1f7c0b05b14dbfa1bb71e7b5b90c0fc4441ae4902e2f19	2026-03-21 22:11:53.409	2026-03-14 22:11:53.444982
499	9	cdeda8e0df5e0bd2fc3c30c7a650219f1e25e92b71b94119c99d6e865d133284	2026-03-21 23:16:35.544	2026-03-14 23:16:35.548055
34	9	4e46ba38beae864ded486b479da808a946ff99eff37bae5ef1d9f9d4631b7098	2026-03-21 22:12:32.996	2026-03-14 22:12:32.999476
36	9	b4ba735ca6e97cc9a282d33d2ebe46e5a9855e95f4792371d5344a3702173c2d	2026-03-21 22:13:19.587	2026-03-14 22:13:19.628347
501	9	1585525befc61165d20e3d01f77745911f154c9ee4605dbc8fe12f132b60b469	2026-03-21 23:17:42.166	2026-03-14 23:17:42.201909
40	21	18bb31cef844eea846d1a6e8ea87ddb19c9e17c2be21cbdb1d2c5a280c3d6c60	2026-03-21 22:40:43.308	2026-03-14 22:40:43.340088
520	9	2dc6ca0b691d6d3f85b858664e91e849499323af7e7fbeac1db96c83af52cd7e	2026-03-22 00:30:15.556	2026-03-15 00:30:15.589546
543	9	5e291d5b975cbbbfd967bdcc6e23414df1f36d9e1fde74e5638b40e0a42703f3	2026-03-22 03:15:19.104	2026-03-15 03:15:19.108568
503	9	3efb0d427e174e8ea225ff228455ec8c4d64309b1278f9efba8480413d24e43c	2026-03-21 23:19:40.406	2026-03-14 23:19:40.438068
563	9	617b7671c00730969d00f063abca845bcbddb65fba6daa6e6a85d6672b622fb7	2026-03-22 04:08:57.378	2026-03-15 04:08:57.412168
509	524	14ddc54f61686bc8a3fc009eced7ffab750e558a64f396e36d574576d3008dcc	2026-03-21 23:36:52.363	2026-03-14 23:36:52.364323
510	524	dfe2c50f2b42a46edbd6cde4b345eeb161ff20ad13876f7119ebdfa194064b37	2026-03-21 23:36:52.802	2026-03-14 23:36:52.802407
511	9	3b929244b091f0851139bac1995876f100a4951a8d38ad2fbe533b0420f257a0	2026-03-21 23:38:10.771	2026-03-14 23:38:10.775327
523	9	a0f9ae1a5b026193bec97bece452ec3eaccc4c5e97195ccb0fea813259e8921f	2026-03-22 00:58:13.968	2026-03-15 00:58:13.973182
530	9	741e60c603c0c9a72426398c4a84ffd74be97e129814f63cbab84aaefe32fff9	2026-03-22 01:31:04.036	2026-03-15 01:31:04.191624
540	9	947878f7aa48d6ead23df154a90e1ef6ff061f5e0384fa4ac65394783a59e8c1	2026-03-22 03:12:04.026	2026-03-15 03:12:04.069597
544	9	1d63460b8ea83e120d91b9bf4284ccc54018e21d5c86566203dda4bb4ea1d5c3	2026-03-22 03:16:43.412	2026-03-15 03:16:43.412992
548	9	778c64dbf610bb16656ec6ddf68c54afc105cff65059027d82b5404128eb1da0	2026-03-22 03:23:57.55	2026-03-15 03:23:57.552932
552	8	afa9a29b67452f31512dc48949e6f5fca34f19c769c75bffac09150fa8e55141	2026-03-22 03:29:53.9	2026-03-15 03:29:53.914711
559	8	369d5f7677eb2db361e56fc521c8316ac38ad4eac8bff9a73ddbd7b9f662b4f7	2026-03-22 03:45:50.308	2026-03-15 03:45:50.343293
147	21	76c85f5576e32573e513e60ded13c409d9f9934fa4eac651a5e649d26b94e7bf	2026-03-21 22:51:27.212	2026-03-14 22:51:27.216073
148	21	8e20cf58d9c447bae24bc40b7ee370f898ca258de38ad245eaa0761447252845	2026-03-21 22:51:31.753	2026-03-14 22:51:31.753232
514	9	bd983a7edd1eeb01a71ae0a7e2ec23f9f87c4fb0cf1a4ff581756dfd81607980	2026-03-21 23:48:29.975	2026-03-14 23:48:29.978973
93	9	782ea7c69f7a59edadb6114092f46aedb8b95184d0656fec045a684c27490843	2026-03-21 22:48:01.293	2026-03-14 22:48:01.295962
526	9	5d45e1faf7c9e229dfcf97ed434525f20b30143ec955e8132863892aeb6ededd	2026-03-22 01:01:53.816	2026-03-15 01:01:53.896062
95	21	195a01e70e9fab01a19d956171c4ba64d02a15ad74ab0439b943b6e6dbaca2bd	2026-03-21 22:49:33.255	2026-03-14 22:49:33.266703
554	8	99d7b72d3784368a942773b4cd652681b02e8167027e5405e7fca09244154f5f	2026-03-22 03:33:15.609	2026-03-15 03:33:15.649635
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, product_id, author_name, rating, comment, tag, created_at) FROM stdin;
1	4	Beğendim	5	Aldım beğendim	Harika Fırsat	2026-03-14 11:30:17.452824
2	9	TestBot1	5	Harika ürün, 1 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:38.965052
3	26	TestBot4	4	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:38.96693
4	20	TestBot3	3	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:38.973769
5	18	TestBot2	3	Harika ürün, 49 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:38.974169
6	2	TestBot5	4	Harika ürün, 80 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:38.977867
7	23	TestBot1	4	Harika ürün, 82 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:39.284216
8	20	TestBot4	5	Harika ürün, 43 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:39.285868
9	42	TestBot2	5	Harika ürün, 30 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:39.293129
10	14	TestBot3	5	Harika ürün, 23 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:39.294748
11	14	TestBot5	3	Harika ürün, 72 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:39.296639
12	2	TestBot6	4	Harika ürün, 75 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.566023
13	3	TestBot7	5	Harika ürün, 27 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.566266
14	24	TestBot9	4	Harika ürün, 81 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.570979
15	23	TestBot10	3	Harika ürün, 85 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.574924
16	10	TestBot8	4	Harika ürün, 73 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.577301
17	16	TestBot6	5	Harika ürün, 13 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.88597
18	45	TestBot7	3	Harika ürün, 66 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.886289
19	9	TestBot9	3	Harika ürün, 50 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.886627
20	19	TestBot10	3	Harika ürün, 76 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.891991
21	24	TestBot8	3	Harika ürün, 61 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:44.895289
22	23	TestBot11	4	Harika ürün, 6 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.141329
23	18	TestBot13	5	Harika ürün, 67 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.142764
24	20	TestBot14	3	Harika ürün, 64 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.151153
25	18	TestBot12	3	Harika ürün, 26 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.151631
26	12	TestBot15	3	Harika ürün, 6 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.152111
27	5	TestBot11	4	Harika ürün, 81 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.457511
28	12	TestBot13	4	Harika ürün, 12 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.458827
29	3	TestBot12	3	Harika ürün, 90 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.467004
30	16	TestBot15	3	Harika ürün, 34 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.46836
31	44	TestBot14	3	Harika ürün, 20 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:50.468791
32	42	TestBot16	3	Harika ürün, 66 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:55.848731
33	3	TestBot19	4	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:55.850068
34	18	TestBot20	3	Harika ürün, 83 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:55.854061
35	14	TestBot17	3	Harika ürün, 6 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:55.856155
36	5	TestBot18	3	Harika ürün, 2 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:55.856627
37	21	TestBot16	3	Harika ürün, 54 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:56.167914
38	21	TestBot19	3	Harika ürün, 53 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:56.168132
39	20	TestBot20	5	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:56.173657
40	19	TestBot18	4	Harika ürün, 6 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:47:56.174086
42	42	TestBot21	3	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.429313
43	45	TestBot22	5	Harika ürün, 94 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.433243
44	6	TestBot24	3	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.434588
45	5	TestBot25	5	Harika ürün, 60 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.436917
46	15	TestBot23	4	Harika ürün, 95 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.437208
47	21	TestBot21	3	Harika ürün, 54 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.74685
48	16	TestBot22	4	Harika ürün, 54 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.751177
49	14	TestBot25	3	Harika ürün, 50 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.752331
50	6	TestBot24	3	Harika ürün, 37 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.7526
51	13	TestBot23	5	Harika ürün, 72 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:01.754244
52	22	TestBot30	3	Harika ürün, 63 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:06.989728
53	6	TestBot26	4	Harika ürün, 68 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:06.99108
54	17	TestBot27	5	Harika ürün, 68 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:06.995989
55	23	TestBot29	3	Harika ürün, 95 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:06.999462
56	4	TestBot28	5	Harika ürün, 61 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:07.001286
57	21	TestBot30	3	Harika ürün, 29 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:07.306109
58	18	TestBot26	3	Harika ürün, 78 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:07.307271
59	18	TestBot27	3	Harika ürün, 56 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:07.314238
60	2	TestBot29	4	Harika ürün, 35 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:07.315594
61	23	TestBot28	5	Harika ürün, 31 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:07.31808
62	20	TestBot31	4	Harika ürün, 97 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.578727
63	11	TestBot32	4	Harika ürün, 85 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.580021
64	15	TestBot34	5	Harika ürün, 20 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.58625
65	1	TestBot35	5	Harika ürün, 98 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.58654
66	20	TestBot33	5	Harika ürün, 47 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.586974
68	6	TestBot32	4	Harika ürün, 20 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.895106
75	11	TestBot37	3	Harika ürün, 49 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.148732
78	7	TestBot38	3	Harika ürün, 7 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.457459
86	45	TestBot44	4	Harika ürün, 87 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:23.71095
87	10	TestBot43	3	Harika ürün, 63 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:24.026367
96	11	TestBot46	3	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.284835
97	42	TestBot48	5	Harika ürün, 2 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.599717
101	3	TestBot47	5	Harika ürün, 89 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.603098
602	707	TestBot4	3	Harika ürün, 34 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:25.722809
611	736	TestBot2	5	Harika ürün, 94 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:25.831311
612	722	TestBot6	3	Harika ürün, 90 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:27.789174
621	2	TestBot8	3	Harika ürün, 4 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:27.900086
622	763	TestBot15	4	Harika ürün, 64 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:29.868615
639	755	TestBot16	4	Harika ürün, 65 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:32.024823
658	701	TestBot26	3	Harika ürün, 18 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:36.261655
662	731	TestBot35	5	Harika ürün, 21 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:38.28057
673	689	TestBot38	5	Harika ürün, 8 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:40.550075
685	646	TestBot44	4	Harika ürün, 11 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:42.643942
69	43	TestBot34	4	Harika ürün, 70 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.902201
71	5	TestBot35	4	Harika ürün, 58 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.905157
73	26	TestBot38	5	Harika ürün, 13 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.141385
76	25	TestBot39	3	Harika ürün, 55 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.149184
77	13	TestBot36	4	Harika ürün, 7 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.456167
80	7	TestBot39	5	Harika ürün, 82 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.464983
83	8	TestBot42	4	Harika ürün, 45 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:23.709839
85	21	TestBot43	4	Harika ürün, 85 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:23.710403
89	25	TestBot42	5	Harika ürün, 27 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:24.027048
91	45	TestBot44	4	Harika ürün, 92 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:24.027606
94	43	TestBot50	5	Harika ürün, 2 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.284107
98	1	TestBot49	3	Harika ürün, 12 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.59998
160	24	TestBot26	4	Harika ürün, 48 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.688811
161	26	TestBot29	5	Harika ürün, 77 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.689139
162	7	TestBot35	4	Harika ürün, 72 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:50.922669
163	25	TestBot31	3	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:50.924963
164	24	TestBot34	4	Harika ürün, 80 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:50.931376
165	42	TestBot32	5	Harika ürün, 84 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:50.932899
166	42	TestBot33	5	Harika ürün, 31 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:50.936627
167	18	TestBot35	5	Harika ürün, 16 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:51.237928
168	10	TestBot31	4	Harika ürün, 83 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:51.239105
169	10	TestBot34	5	Harika ürün, 38 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:51.246775
170	25	TestBot32	3	Harika ürün, 49 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:51.24935
171	19	TestBot33	4	Harika ürün, 66 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:51.250739
172	43	TestBot36	5	Harika ürün, 17 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.488766
173	25	TestBot40	4	Harika ürün, 67 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.490446
174	22	TestBot39	4	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.492671
175	11	TestBot38	4	Harika ürün, 4 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.494156
176	16	TestBot37	5	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.494706
177	42	TestBot36	4	Harika ürün, 76 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.806187
178	23	TestBot40	5	Harika ürün, 49 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.806476
179	44	TestBot39	4	Harika ürün, 60 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.807544
180	21	TestBot38	5	Harika ürün, 59 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.809073
181	24	TestBot37	3	Harika ürün, 30 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:56.811305
182	10	TestBot45	4	Harika ürün, 61 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.070884
183	11	TestBot41	5	Harika ürün, 25 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.071117
184	43	TestBot44	5	Harika ürün, 98 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.082253
185	12	TestBot43	3	Harika ürün, 70 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.082438
186	20	TestBot42	3	Harika ürün, 4 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.084041
187	6	TestBot45	5	Harika ürün, 38 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.386131
188	23	TestBot41	3	Harika ürün, 94 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.388292
189	3	TestBot44	4	Harika ürün, 18 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.39739
190	18	TestBot42	5	Harika ürün, 1 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.398909
191	14	TestBot43	5	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:02.399369
192	43	TestBot46	4	Harika ürün, 44 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.640419
193	13	TestBot50	3	Harika ürün, 19 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.641932
194	22	TestBot48	4	Harika ürün, 68 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.642195
195	17	TestBot49	3	Harika ürün, 23 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.644571
196	15	TestBot47	3	Harika ürün, 47 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.646318
197	45	TestBot46	3	Harika ürün, 17 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.957778
198	16	TestBot50	3	Harika ürün, 52 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.960085
199	15	TestBot48	4	Harika ürün, 56 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.960452
200	43	TestBot49	3	Harika ürün, 45 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.960838
201	45	TestBot47	4	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:54:07.962473
202	15	TestBot5	5	Harika ürün, 98 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:39.933242
203	43	TestBot4	4	Harika ürün, 61 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:39.94255
204	1	TestBot2	3	Harika ürün, 63 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:39.944167
205	12	TestBot1	3	Harika ürün, 45 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:39.946747
206	5	TestBot3	3	Harika ürün, 12 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:39.949579
207	4	TestBot5	4	Harika ürün, 82 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:40.025081
208	26	TestBot4	4	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:40.037881
209	19	TestBot2	4	Harika ürün, 18 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:40.040359
210	20	TestBot1	3	Harika ürün, 63 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:40.040988
211	3	TestBot3	4	Harika ürün, 4 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:40.046204
212	1	TestBot7	3	Harika ürün, 82 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:41.985857
67	42	TestBot31	3	Harika ürün, 36 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.89483
74	12	TestBot40	4	Harika ürün, 81 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.147229
79	18	TestBot40	5	Harika ürün, 32 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.463356
84	25	TestBot41	3	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:23.710103
88	18	TestBot45	5	Harika ürün, 22 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:24.026757
92	7	TestBot48	3	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.281569
95	7	TestBot47	3	Harika ürün, 53 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.284573
99	17	TestBot46	5	Harika ürün, 42 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.602239
603	679	TestBot3	4	Harika ürün, 39 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:25.727804
606	656	TestBot2	4	Harika ürün, 13 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:25.732335
609	10	TestBot1	4	Harika ürün, 4 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:25.829968
616	751	TestBot8	3	Harika ürün, 16 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:27.799503
620	714	TestBot9	5	Harika ürün, 43 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:27.899795
635	751	TestBot19	4	Harika ürün, 15 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:31.929048
638	757	TestBot18	4	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:32.017899
650	761	TestBot22	3	Harika ürün, 28 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:34.090654
670	43	TestBot32	4	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:38.39093
690	758	TestBot45	3	Harika ürün, 19 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:42.741402
692	717	TestBot50	4	Harika ürün, 18 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:44.696964
698	15	TestBot47	4	Harika ürün, 79 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:44.796514
70	15	TestBot33	4	Harika ürün, 47 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:12.903584
72	44	TestBot36	4	Harika ürün, 78 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.140092
81	3	TestBot37	3	Harika ürün, 58 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:18.465398
82	4	TestBot45	4	Harika ürün, 91 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:23.708416
90	6	TestBot41	4	Harika ürün, 52 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:24.027344
93	43	TestBot49	5	Harika ürün, 61 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.281808
100	22	TestBot50	4	Harika ürün, 5 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:48:29.602631
102	21	TestBot4	5	Harika ürün, 31 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:16.814385
103	42	TestBot2	4	Harika ürün, 66 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:16.816166
104	10	TestBot5	3	Harika ürün, 64 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:16.816163
105	11	TestBot3	3	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:16.816618
106	7	TestBot1	4	Harika ürün, 75 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:16.8173
107	4	TestBot4	4	Harika ürün, 56 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:17.133672
108	19	TestBot2	5	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:17.137076
109	25	TestBot3	4	Harika ürün, 50 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:17.137782
110	19	TestBot5	4	Harika ürün, 18 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:17.138626
111	3	TestBot1	3	Harika ürün, 77 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:17.139002
112	45	TestBot6	5	Harika ürün, 48 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.450622
113	6	TestBot7	5	Harika ürün, 62 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.459928
114	4	TestBot10	5	Harika ürün, 26 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.461379
115	6	TestBot9	3	Harika ürün, 56 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.46164
116	8	TestBot8	4	Harika ürün, 39 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.464409
117	10	TestBot6	5	Harika ürün, 55 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.7693
118	2	TestBot7	3	Harika ürün, 97 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.794718
119	1	TestBot10	4	Harika ürün, 22 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.795113
120	12	TestBot9	3	Harika ürün, 64 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.795447
121	9	TestBot8	5	Harika ürün, 82 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:22.797862
122	10	TestBot11	4	Harika ürün, 42 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.082913
123	26	TestBot15	3	Harika ürün, 21 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.083531
124	19	TestBot13	3	Harika ürün, 15 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.084442
125	8	TestBot14	5	Harika ürün, 84 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.088923
126	43	TestBot12	4	Harika ürün, 11 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.089188
127	19	TestBot11	4	Harika ürün, 94 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.400801
128	8	TestBot15	4	Harika ürün, 65 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.404244
129	8	TestBot13	3	Harika ürün, 92 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.406008
130	7	TestBot14	3	Harika ürün, 74 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.406289
131	22	TestBot12	3	Harika ürün, 65 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:28.407869
132	1	TestBot16	3	Harika ürün, 29 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:33.705256
133	5	TestBot20	5	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:33.707989
134	45	TestBot17	5	Harika ürün, 12 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:33.712328
135	5	TestBot18	3	Harika ürün, 61 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:33.715634
136	44	TestBot19	3	Harika ürün, 66 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:33.717802
137	42	TestBot16	4	Harika ürün, 32 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:34.02412
138	19	TestBot20	3	Harika ürün, 78 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:34.026406
139	13	TestBot17	4	Harika ürün, 45 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:34.04127
140	6	TestBot18	5	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:34.041867
141	9	TestBot19	4	Harika ürün, 61 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:34.042234
142	6	TestBot24	4	Harika ürün, 53 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:39.745839
143	14	TestBot21	4	Harika ürün, 20 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:39.773528
144	5	TestBot25	4	Harika ürün, 6 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:39.795898
145	1	TestBot22	3	Harika ürün, 61 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:39.798413
146	14	TestBot23	4	Harika ürün, 48 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:39.801487
147	17	TestBot24	3	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:40.059295
148	21	TestBot21	5	Harika ürün, 65 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:40.087733
149	1	TestBot25	3	Harika ürün, 54 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:40.112593
151	43	TestBot23	3	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:40.117518
152	7	TestBot28	5	Harika ürün, 77 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.360521
153	43	TestBot30	3	Harika ürün, 52 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.362959
154	26	TestBot27	3	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.36854
155	10	TestBot29	3	Harika ürün, 49 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.372849
156	17	TestBot26	3	Harika ürün, 92 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.373054
157	43	TestBot28	5	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.676488
158	12	TestBot30	4	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.678901
159	8	TestBot27	4	Harika ürün, 15 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:53:45.683954
213	42	TestBot8	4	Harika ürün, 23 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:41.987324
220	2	TestBot9	3	Harika ürün, 56 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:42.085896
224	17	TestBot14	5	Harika ürün, 20 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:44.030275
225	4	TestBot15	5	Harika ürün, 15 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:44.033574
228	9	TestBot11	5	Harika ürün, 72 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:44.121749
235	2	TestBot17	5	Harika ürün, 18 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.091847
239	16	TestBot20	3	Harika ürün, 15 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.188021
242	14	TestBot24	3	Harika ürün, 28 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.137197
251	8	TestBot23	5	Harika ürün, 88 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.241649
252	12	TestBot30	4	Harika ürün, 87 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.176328
254	3	TestBot26	4	Harika ürün, 4 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.179672
262	3	TestBot34	3	Harika ürün, 76 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.219116
264	25	TestBot32	5	Harika ürün, 99 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.233283
270	13	TestBot32	5	Harika ürün, 33 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.329733
273	26	TestBot40	4	Harika ürün, 51 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.266572
280	15	TestBot38	4	Harika ürün, 62 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.371286
286	11	TestBot45	5	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:56.316515
291	6	TestBot45	4	Harika ürün, 56 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:56.410775
293	16	TestBot49	5	Harika ürün, 96 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:58.416935
300	22	TestBot46	3	Harika ürün, 4 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:58.521343
604	21	TestBot1	3	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:25.730469
607	6	TestBot4	3	Harika ürün, 16 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:25.819497
630	704	TestBot12	3	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:29.970502
651	671	TestBot23	5	Harika ürün, 83 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:34.091177
660	763	TestBot30	5	Harika ürün, 31 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:36.264907
666	656	TestBot33	5	Harika ürün, 7 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:38.295843
680	683	TestBot39	5	Harika ürün, 20 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:40.653711
682	707	TestBot41	4	Harika ürün, 5 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:42.630817
214	25	TestBot9	4	Harika ürün, 16 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:41.988899
215	10	TestBot6	4	Harika ürün, 36 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:41.989135
218	42	TestBot8	4	Harika ürün, 37 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:42.084195
219	22	TestBot6	4	Harika ürün, 28 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:42.085616
226	44	TestBot13	4	Harika ürün, 58 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:44.035901
230	21	TestBot15	5	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:44.13041
231	42	TestBot13	4	Harika ürün, 13 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:44.132323
233	42	TestBot16	3	Harika ürün, 39 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.091276
236	1	TestBot20	4	Harika ürün, 19 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.092378
237	24	TestBot19	4	Harika ürün, 63 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.186374
238	13	TestBot16	4	Harika ürün, 57 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.187774
245	10	TestBot25	3	Harika ürün, 7 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.144751
246	25	TestBot23	3	Harika ürün, 27 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.14697
247	14	TestBot24	4	Harika ürün, 85 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.232287
248	26	TestBot21	4	Harika ürün, 13 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.234917
255	10	TestBot28	5	Harika ürün, 25 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.182379
256	43	TestBot29	4	Harika ürün, 85 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.186016
257	22	TestBot30	5	Harika ürün, 46 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.273621
258	18	TestBot26	5	Harika ürün, 73 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.273944
260	26	TestBot28	4	Harika ürün, 88 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.276806
261	13	TestBot29	5	Harika ürün, 55 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.283301
265	17	TestBot31	4	Harika ürün, 37 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.233524
268	25	TestBot33	5	Harika ürün, 47 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.319392
272	2	TestBot36	3	Harika ürün, 35 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.265067
275	5	TestBot37	4	Harika ürün, 57 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.276353
278	5	TestBot40	4	Harika ürün, 71 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.362408
281	11	TestBot37	4	Harika ürün, 50 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.372789
283	25	TestBot42	3	Harika ürün, 29 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:56.306641
284	3	TestBot44	5	Harika ürün, 43 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:56.306933
290	11	TestBot43	5	Harika ürün, 92 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:56.4103
294	24	TestBot50	4	Harika ürün, 35 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:58.419573
296	13	TestBot48	3	Harika ürün, 67 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:58.420523
297	15	TestBot47	4	Harika ürün, 82 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:58.517017
298	10	TestBot49	5	Harika ürün, 38 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:58.518268
605	743	TestBot5	5	Harika ürün, 34 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:25.730797
613	753	TestBot7	5	Harika ürün, 23 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:27.790591
216	22	TestBot10	3	Harika ürün, 51 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:41.992214
217	43	TestBot7	4	Harika ürün, 66 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:42.083917
222	20	TestBot12	5	Harika ürün, 14 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:44.025042
227	45	TestBot12	5	Harika ürün, 91 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:44.121465
234	21	TestBot18	4	Harika ürün, 98 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.091514
240	16	TestBot17	5	Harika ürün, 44 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.190329
250	42	TestBot25	4	Harika ürün, 70 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.239994
253	15	TestBot27	4	Harika ürün, 97 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.177859
259	44	TestBot27	3	Harika ürün, 14 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:50.275169
263	1	TestBot33	4	Harika ürün, 78 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.225119
276	12	TestBot38	4	Harika ürün, 79 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.276752
277	5	TestBot36	4	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.360075
285	6	TestBot43	3	Harika ürün, 84 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:56.313883
288	45	TestBot42	3	Harika ürün, 98 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:56.402383
301	26	TestBot48	5	Harika ürün, 53 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:58.521586
617	749	TestBot6	4	Harika ürün, 17 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:27.887639
626	43	TestBot13	4	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:29.875032
627	675	TestBot15	5	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:29.96673
641	708	TestBot17	5	Harika ürün, 14 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:32.028719
647	729	TestBot21	4	Harika ürün, 39 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:34.080075
674	749	TestBot37	5	Harika ürün, 4 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:40.552659
676	14	TestBot36	5	Harika ürün, 44 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:40.556829
686	9	TestBot45	4	Harika ürün, 12 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:42.644206
221	44	TestBot10	3	Harika ürün, 31 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:42.088481
223	25	TestBot11	3	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:44.025279
232	1	TestBot19	4	Harika ürün, 1 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.090721
241	42	TestBot18	3	Harika ürün, 24 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:46.190654
243	8	TestBot21	4	Harika ürün, 21 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.139518
244	17	TestBot22	5	Harika ürün, 90 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.142315
249	17	TestBot22	4	Harika ürün, 14 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:48.239675
266	24	TestBot35	4	Harika ürün, 21 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.235969
267	6	TestBot34	3	Harika ürün, 31 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.313507
269	6	TestBot31	3	Harika ürün, 86 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.329297
271	20	TestBot35	4	Harika ürün, 86 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:52.331961
274	2	TestBot39	5	Harika ürün, 5 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.273841
279	44	TestBot39	5	Harika ürün, 32 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:54.370989
282	2	TestBot41	4	Harika ürün, 27 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:56.305356
287	42	TestBot41	5	Harika ürün, 81 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:56.40213
292	3	TestBot47	4	Harika ürün, 67 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:58.416494
295	43	TestBot46	5	Harika ürün, 42 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:55:58.420229
636	13	TestBot17	5	Harika ürün, 57 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:31.930595
303	19	TestBot1	3	Harika ürün, 28 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:58:30.391127
646	12	TestBot22	4	Harika ürün, 46 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:33.993751
648	750	TestBot24	4	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:34.081535
653	713	TestBot26	3	Harika ürün, 82 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:36.068703
665	735	TestBot32	3	Harika ürün, 56 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:38.294104
681	43	TestBot36	3	Harika ürün, 18 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:40.654038
697	10	TestBot50	3	Harika ürün, 61 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:44.79632
318	21	TestBot8	3	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:58:32.687275
321	1	TestBot9	3	Harika ürün, 39 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:58:32.701123
343	43	TestBot24	3	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:58:39.008164
699	680	TestBot49	5	Harika ürün, 90 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:09:44.798263
357	5	TestBot26	3	Harika ürün, 48 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:58:41.151311
702	676	TestBot5	3	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:10:55.992034
705	4	TestBot4	5	Harika ürün, 21 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:10:56.010725
708	659	TestBot3	5	Harika ürün, 15 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:10:56.088899
726	2	TestBot12	5	Harika ürün, 33 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:00.412255
371	13	TestBot33	4	Harika ürün, 59 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:58:43.201548
379	17	TestBot38	4	Harika ürün, 26 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:58:45.240137
741	691	TestBot20	5	Harika ürün, 42 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:02.610873
751	725	TestBot24	5	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:04.666894
761	694	TestBot30	3	Harika ürün, 98 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:06.773988
762	696	TestBot31	5	Harika ürün, 21 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:08.80308
786	23	TestBot42	4	Harika ürün, 76 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:13.008879
787	1	TestBot41	4	Harika ürün, 64 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:13.104946
795	703	TestBot50	5	Harika ürün, 33 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:15.064778
797	21	TestBot48	5	Harika ürün, 65 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:15.159912
703	738	TestBot3	5	Harika ürün, 78 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:10:55.992325
721	656	TestBot10	3	Harika ürün, 12 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:10:58.176385
734	681	TestBot19	3	Harika ürün, 41 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:02.512763
739	725	TestBot16	4	Harika ürün, 20 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:02.610096
744	676	TestBot21	3	Harika ürün, 24 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:04.568274
748	5	TestBot22	4	Harika ürün, 79 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:04.658068
769	717	TestBot35	3	Harika ürün, 12 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:08.902753
772	681	TestBot36	4	Harika ürün, 76 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:10.903289
777	724	TestBot36	5	Harika ürün, 41 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:10.998429
778	748	TestBot37	3	Harika ürün, 50 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:11.013899
789	1	TestBot44	5	Harika ürün, 7 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:13.105452
706	761	TestBot2	5	Harika ürün, 44 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:10:56.012753
715	25	TestBot7	4	Harika ürün, 7 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:10:58.078008
719	669	TestBot6	4	Harika ürün, 68 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:10:58.172222
729	660	TestBot13	4	Harika ürün, 71 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:00.508056
735	17	TestBot17	4	Harika ürün, 97 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:02.513046
737	2	TestBot18	3	Harika ürün, 46 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:02.607479
749	696	TestBot21	3	Harika ürün, 90 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:04.665189
752	733	TestBot26	5	Harika ürün, 94 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:06.657072
771	753	TestBot33	3	Harika ürün, 34 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:08.91224
773	681	TestBot38	4	Harika ürün, 94 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:10.915572
779	668	TestBot38	4	Harika ürün, 85 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:11.014524
791	655	TestBot42	4	Harika ürün, 47 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:13.107036
796	693	TestBot49	5	Harika ürün, 84 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:15.066443
724	13	TestBot13	3	Harika ürün, 30 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:00.409676
730	729	TestBot15	3	Harika ürün, 69 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:00.508496
732	722	TestBot18	4	Harika ürün, 37 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:02.510844
373	24	TestBot40	3	Harika ürün, 66 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:58:45.136164
747	704	TestBot25	4	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:04.655707
760	742	TestBot29	3	Harika ürün, 85 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:06.773597
766	689	TestBot33	5	Harika ürün, 68 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:08.813037
768	676	TestBot31	4	Harika ürün, 81 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:08.901636
386	6	TestBot44	3	Harika ürün, 4 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:58:49.065789
790	686	TestBot43	5	Harika ürün, 80 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:13.105646
794	711	TestBot46	5	Harika ürün, 35 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:15.062552
800	686	TestBot50	5	Harika ürün, 95 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:15.161518
402	687	TestBot4	4	Harika ürün, 81 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:22.049907
403	731	TestBot3	4	Harika ürün, 64 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:22.05431
404	659	TestBot2	4	Harika ürün, 70 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:22.059259
405	740	TestBot5	4	Harika ürün, 76 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:22.061109
407	737	TestBot4	3	Harika ürün, 55 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:22.15005
408	14	TestBot3	3	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:22.152097
409	692	TestBot2	5	Harika ürün, 95 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:22.157928
410	12	TestBot5	5	Harika ürün, 22 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:22.16754
411	686	TestBot1	4	Harika ürün, 52 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:22.169248
412	693	TestBot6	5	Harika ürün, 14 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:24.118366
414	660	TestBot9	5	Harika ürün, 34 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:24.133746
415	761	TestBot10	4	Harika ürün, 84 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:24.136366
417	675	TestBot6	4	Harika ürün, 66 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:24.215399
418	711	TestBot8	3	Harika ürün, 90 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:24.216423
419	694	TestBot9	3	Harika ürün, 2 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:24.231378
421	716	TestBot7	5	Harika ürün, 85 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:24.235749
422	709	TestBot11	5	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:26.232673
423	22	TestBot15	4	Harika ürün, 23 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:26.232978
424	736	TestBot13	3	Harika ürün, 99 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:26.236786
425	10	TestBot12	4	Harika ürün, 80 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:26.239454
426	730	TestBot14	5	Harika ürün, 28 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:26.240817
427	709	TestBot11	4	Harika ürün, 71 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:26.329218
429	718	TestBot13	5	Harika ürün, 64 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:26.334743
430	754	TestBot12	5	Harika ürün, 25 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:26.337593
431	657	TestBot14	5	Harika ürün, 64 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:26.338966
432	660	TestBot16	3	Harika ürün, 84 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:28.344747
434	728	TestBot20	5	Harika ürün, 6 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:28.356173
435	763	TestBot18	5	Harika ürün, 37 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:28.375451
436	697	TestBot17	3	Harika ürün, 64 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:28.375954
437	24	TestBot16	4	Harika ürün, 84 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:28.441922
438	23	TestBot19	3	Harika ürün, 60 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:28.447098
439	647	TestBot20	5	Harika ürün, 13 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:28.456636
440	741	TestBot18	4	Harika ürün, 87 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:28.470928
441	712	TestBot17	4	Harika ürün, 62 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:28.472
442	665	TestBot25	4	Harika ürün, 97 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:30.429544
444	7	TestBot22	3	Harika ürün, 5 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:30.430572
445	676	TestBot24	4	Harika ürün, 96 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:30.4374
446	751	TestBot21	5	Harika ürün, 37 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:30.440557
448	17	TestBot22	4	Harika ürün, 76 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:30.532678
449	760	TestBot23	5	Harika ürün, 86 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:30.532606
451	739	TestBot21	3	Harika ürün, 13 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:30.53775
452	700	TestBot27	5	Harika ürün, 75 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.4926
453	23	TestBot28	3	Harika ürün, 91 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.494636
454	715	TestBot29	5	Harika ürün, 22 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.499038
455	727	TestBot30	3	Harika ürün, 18 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.500384
456	724	TestBot26	5	Harika ürün, 12 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.502266
457	650	TestBot27	5	Harika ürün, 96 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.590295
458	724	TestBot29	3	Harika ürün, 8 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.595553
459	21	TestBot26	4	Harika ürün, 30 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.599331
460	752	TestBot30	4	Harika ürün, 19 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.599259
461	720	TestBot28	4	Harika ürün, 79 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:32.602579
462	697	TestBot34	3	Harika ürün, 74 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:34.54833
463	715	TestBot35	5	Harika ürün, 22 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:34.552909
464	743	TestBot31	4	Harika ürün, 30 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:34.553602
465	653	TestBot32	4	Harika ürün, 10 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:34.554486
466	9	TestBot33	3	Harika ürün, 19 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:34.567597
467	646	TestBot34	4	Harika ürün, 78 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:34.649731
720	764	TestBot7	3	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:10:58.173497
723	734	TestBot11	3	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:00.409183
470	717	TestBot31	5	Harika ürün, 88 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:34.657377
471	707	TestBot33	5	Harika ürün, 65 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:34.666311
472	697	TestBot40	4	Harika ürün, 24 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.61528
473	19	TestBot38	3	Harika ürün, 41 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.642532
474	679	TestBot39	5	Harika ürün, 15 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.643096
475	11	TestBot37	5	Harika ürün, 38 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.684863
476	714	TestBot36	5	Harika ürün, 28 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.68617
477	694	TestBot40	5	Harika ürün, 30 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.711817
478	650	TestBot38	3	Harika ürün, 41 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.737533
479	660	TestBot39	3	Harika ürün, 77 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.737578
480	727	TestBot37	5	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.781344
481	20	TestBot36	5	Harika ürün, 76 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:36.781828
482	656	TestBot41	5	Harika ürün, 3 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:38.718565
483	684	TestBot44	3	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:38.720835
484	763	TestBot42	3	Harika ürün, 1 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:38.726661
486	44	TestBot43	3	Harika ürün, 54 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:38.729715
487	725	TestBot41	5	Harika ürün, 87 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:38.814226
488	763	TestBot44	5	Harika ürün, 29 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:38.815531
489	647	TestBot42	3	Harika ürün, 95 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:38.822519
490	727	TestBot43	3	Harika ürün, 24 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:38.825289
491	3	TestBot45	4	Harika ürün, 13 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:38.826373
493	698	TestBot49	3	Harika ürün, 85 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:40.947557
494	757	TestBot48	3	Harika ürün, 56 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:40.949463
495	707	TestBot47	4	Harika ürün, 86 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:40.997381
496	723	TestBot50	3	Harika ürün, 65 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:40.998801
497	693	TestBot46	5	Harika ürün, 91 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:41.041929
738	674	TestBot19	5	Harika ürün, 78 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:02.607744
499	723	TestBot48	4	Harika ürün, 68 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:41.045964
500	678	TestBot47	4	Harika ürün, 63 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:41.093675
501	5	TestBot50	5	Harika ürün, 28 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 22:59:41.093928
750	709	TestBot23	3	Harika ürün, 45 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:04.666515
504	11	TestBot3	5	Harika ürün, 91 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:48.310101
505	715	TestBot4	3	Harika ürün, 81 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:48.311559
753	734	TestBot28	3	Harika ürün, 33 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:06.658532
517	759	TestBot7	4	Harika ürün, 60 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:50.499839
523	691	TestBot12	4	Harika ürün, 34 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:52.487238
528	742	TestBot13	5	Harika ürün, 6 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:52.583928
534	668	TestBot17	3	Harika ürün, 88 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:54.556216
774	661	TestBot37	3	Harika ürün, 65 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:10.915895
785	734	TestBot41	3	Harika ürün, 44 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:13.006627
788	690	TestBot45	3	Harika ürün, 37 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:13.105219
793	25	TestBot47	5	Harika ürün, 58 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:15.062357
564	8	TestBot33	5	Harika ürün, 13 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:00.977323
569	679	TestBot33	5	Harika ürün, 34 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:01.075491
799	732	TestBot46	4	Harika ürün, 41 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:11:15.160473
583	750	TestBot42	3	Harika ürün, 21 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:05.143639
600	687	TestBot46	5	Harika ürün, 26 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:07.317754
507	702	TestBot5	5	Harika ürün, 58 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:48.399412
802	1248	Kullanıcı	5	Harika bir ürün kulllandım	\N	2026-03-15 03:16:08.399175
531	746	TestBot15	4	Harika ürün, 29 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:52.587796
535	680	TestBot20	3	Harika ürün, 14 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:54.56404
539	751	TestBot18	4	Harika ürün, 21 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:54.653904
546	651	TestBot23	4	Harika ürün, 48 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:56.841278
556	741	TestBot26	5	Harika ürün, 89 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:58.903276
572	681	TestBot36	5	Harika ürün, 54 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:03.023623
574	744	TestBot39	3	Harika ürün, 2 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:03.027969
582	693	TestBot41	5	Harika ürün, 43 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:05.141948
589	649	TestBot44	4	Harika ürün, 22 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:05.250994
601	712	TestBot47	5	Harika ürün, 83 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:07.318087
508	732	TestBot3	4	Harika ürün, 31 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:48.408063
514	666	TestBot9	3	Harika ürün, 37 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:50.406596
522	755	TestBot14	3	Harika ürün, 34 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:52.485905
530	705	TestBot11	4	Harika ürün, 73 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:52.586119
515	736	TestBot10	3	Harika ürün, 36 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:50.409784
536	13	TestBot16	3	Harika ürün, 71 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:54.565512
538	691	TestBot17	3	Harika ürün, 29 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:54.653634
557	684	TestBot30	5	Harika ürün, 38 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:58.987995
573	703	TestBot40	3	Harika ürün, 52 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:03.025306
588	713	TestBot42	3	Harika ürün, 25 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:05.238655
526	739	TestBot15	4	Harika ürün, 40 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:52.490602
527	742	TestBot14	5	Harika ürün, 93 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:52.583495
533	647	TestBot18	5	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:54.555771
542	673	TestBot21	3	Harika ürün, 7 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:56.833822
543	676	TestBot22	4	Harika ürün, 9 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:56.837193
548	735	TestBot22	3	Harika ürün, 80 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:56.934662
559	661	TestBot29	3	Harika ürün, 65 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:58.996519
560	754	TestBot27	4	Harika ürün, 41 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:07:59.000149
562	738	TestBot31	4	Harika ürün, 67 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:00.971576
563	12	TestBot35	3	Harika ürün, 31 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:00.97497
565	16	TestBot32	5	Harika ürün, 86 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:00.980994
570	673	TestBot32	3	Harika ürün, 56 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:01.078109
575	762	TestBot37	4	Harika ürün, 90 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:03.030607
577	717	TestBot36	4	Harika ürün, 73 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:03.128103
584	674	TestBot44	4	Harika ürün, 53 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:05.153027
587	691	TestBot41	4	Harika ürün, 46 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:05.238403
596	42	TestBot49	5	Harika ürün, 21 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:07.220993
597	699	TestBot50	4	Harika ürün, 28 gündür kullanıyorum. Kesinlikle tavsiye.	\N	2026-03-14 23:08:07.316036
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, user_id, plan, status, amount, payment_method, account_info, account_name, start_date, end_date, requested_at, activated_at) FROM stdin;
\.


--
-- Data for Name: unique_product_clicks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unique_product_clicks (id, product_id, creator_user_id, session_id, year_month, click_date, created_at) FROM stdin;
1	1	\N	test-session-abc	2026-03	2026-03-14	2026-03-14 16:30:33.066904
2	1	\N	test-xyz-123	2026-03	2026-03-14	2026-03-14 16:30:38.328813
3	1	\N	test-session-123	2026-03	2026-03-14	2026-03-14 16:31:17.221772
\.


--
-- Data for Name: user_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_accounts (id, email, total_points, created_at, display_name, phone, password_hash, email_verified, phone_verified, otp_code, otp_expiry, role, loyalty_months, is_champion, champion_multiplier, bio, social_link) FROM stdin;
3	suleymanoky@gmail.com	0	2026-03-14 19:10:20.269039	suleyman06	05418944647	$2b$12$vEfZEb8fPa.eHkMpdCGMvOYjsTOlpbUSFVSxIHS4PooUcisP3dUl6	f	f	378965	2026-03-14 19:20:20.268	user	0	f	1	\N	\N
7	yenitest@gmail.com	0	2026-03-14 19:21:13.397404	Test Kullanici	\N	$2b$12$52odQBWYiBuefTluSE9PLeOKddwqRyPKgfnFhBRcPd0l1HHHDt/ka	f	f	157473	2026-03-14 19:31:13.757	user	0	f	1	\N	\N
523	test_delete@vitrin.test	0	2026-03-14 23:36:38.009321	TestSil	\N	$2b$12$cQrGX4OOeNeKKREkwv4dou2rnU37DyCYLw3LlZR1Edd42B04TMjRW	f	f	670344	2026-03-14 23:46:38.744	user	0	f	1	\N	\N
524	test_del2@vitrin.test	0	2026-03-14 23:36:52.106659	TestSil2	\N	$2b$12$3.bRdIuvAGLCDGoCzvVwfONG4BdsVpxx.u1UhYu7aPB4xI29ruLTW	t	f	\N	\N	user	1	f	1	\N	\N
1	test@fiyatdedektifi.com	18	2026-03-14 15:56:17.192516	\N	\N	\N	f	f	\N	\N	user	0	f	1	\N	\N
5	suleymanokay@gmail.com	5	2026-03-14 19:13:43.448245	suleymanokay06	5418944647	$2b$12$90BVPaVCITBQgtgp7fqNyegIITR1Co5X9GQ9B3aFsSkP3beeUFCCi	f	f	786721	2026-03-14 19:23:43.447	admin	0	f	1	\N	\N
8	05418944647@vitrin.phone	113	2026-03-14 19:23:15.943914	King	05418944647	$2b$12$hh.pHomThfUQKBCqEITDZOxD3T.4QlZQDbq9smL1ECuhafuifcp2.	t	f	\N	\N	user	1	f	1	\N	\N
9	suleymanokay0641@gmail.com	316	2026-03-14 20:02:51.063962	King06	\N	$2b$12$0eSDzj3BhJvFNv.zcorDGOZNRRZUtq/FTC/rDXZBD2gnI8ExpgFwi	t	f	\N	\N	admin	1	f	1	\N	\N
2	test@vitrin.com	5	2026-03-14 19:08:09.213027	\N	\N	$2b$12$qNbt/8B39GoEutClTJP9aeVEHF5JzO9TN1LO3/tijIf.0zW4KMYgq	f	f	205160	2026-03-14 19:18:09.211	user	0	f	1	\N	\N
472	test@test.com	5	2026-03-14 23:10:14.942563	\N	\N	$2b$12$.cJKCOeZLzLDmgwvC7wYM.eEuBoAhV5mpmpakfLkyPD1gO2RkMxVG	f	f	147155	2026-03-14 23:20:14.942	user	0	f	1	\N	\N
10	test@vitrin.app	5	2026-03-14 20:23:47.421611	TestKullanici	\N	$2b$10$kaFF2jouTpJkbMXJ5tRJx.iRUkLz6Cs3c10tcIuzfTS05JhGJLxGy	t	f	\N	\N	user	0	f	1	\N	\N
21	bttf_forever@hotmail.com	183	2026-03-14 22:35:30.942664	KingBTTF	\N	$2b$12$UaKIHE0k7AQaSJpirDfYkute0WrD4oxBSQrF3sg7evx7/6KGO5sSO	t	f	\N	\N	user	1	f	1	\N	\N
\.


--
-- Data for Name: user_daily_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_daily_tasks (id, user_id, task_type, year_month_day, points_earned, completed_at) FROM stdin;
1	9	add_product	2026-03-14	10	2026-03-14 20:03:23.088229
2	9	add_product	2026-03-14	10	2026-03-14 20:03:23.781549
3	9	add_product	2026-03-14	10	2026-03-14 20:03:23.790936
4	9	share_vitrin	2026-03-14	15	2026-03-14 20:03:24.330376
5	9	create_collection	2026-03-14	20	2026-03-14 20:03:28.767317
6	9	follow_user	2026-03-14	5	2026-03-14 20:03:32.089902
7	9	follow_user	2026-03-14	5	2026-03-14 20:03:32.837793
8	9	follow_user	2026-03-14	5	2026-03-14 20:03:35.326492
9	9	login	2026-03-14	2	2026-03-14 20:03:38.017442
10	9	review_product	2026-03-14	8	2026-03-14 20:03:40.388333
11	9	vote_product	2026-03-14	3	2026-03-14 20:03:41.269079
12	9	review_product	2026-03-14	8	2026-03-14 20:03:44.309435
13	9	vote_product	2026-03-14	3	2026-03-14 20:03:45.268857
14	9	vote_product	2026-03-14	3	2026-03-14 20:03:45.457912
15	9	vote_product	2026-03-14	3	2026-03-14 20:03:46.654493
16	9	vote_product	2026-03-14	3	2026-03-14 20:03:47.507944
17	21	add_product	2026-03-14	10	2026-03-14 22:39:42.309042
18	21	add_product	2026-03-14	10	2026-03-14 22:39:45.610341
19	21	add_product	2026-03-14	10	2026-03-14 22:39:47.258365
20	21	share_vitrin	2026-03-14	15	2026-03-14 22:47:19.018903
21	21	follow_user	2026-03-14	5	2026-03-14 22:47:23.231386
22	21	follow_user	2026-03-14	5	2026-03-14 22:47:23.93586
23	21	follow_user	2026-03-14	5	2026-03-14 22:47:26.299243
24	21	login	2026-03-14	2	2026-03-14 22:47:30.487064
25	21	vote_product	2026-03-14	3	2026-03-14 22:47:33.775583
6433	9	share_vitrin	2026-03-15	15	2026-03-15 01:07:38.59974
6434	9	add_product	2026-03-15	10	2026-03-15 01:07:47.017048
6435	9	add_product	2026-03-15	10	2026-03-15 01:07:47.838615
6449	8	add_product	2026-03-15	10	2026-03-15 03:28:52.070009
6450	8	add_product	2026-03-15	10	2026-03-15 03:28:59.589974
6451	8	add_product	2026-03-15	10	2026-03-15 03:29:01.366225
76	21	review_product	2026-03-14	8	2026-03-14 22:47:37.568013
82	21	vote_product	2026-03-14	3	2026-03-14 22:47:37.973404
93	21	review_product	2026-03-14	8	2026-03-14 22:47:38.638618
6436	9	add_product	2026-03-15	10	2026-03-15 01:07:48.186876
6437	9	create_collection	2026-03-15	20	2026-03-15 01:07:51.217028
6438	9	follow_user	2026-03-15	5	2026-03-15 01:07:55.58786
6439	9	follow_user	2026-03-15	5	2026-03-15 01:07:56.487851
6440	9	follow_user	2026-03-15	5	2026-03-15 01:07:56.546401
6441	9	login	2026-03-15	2	2026-03-15 01:08:03.044507
6442	9	review_product	2026-03-15	8	2026-03-15 01:08:12.484521
6443	9	review_product	2026-03-15	8	2026-03-15 01:08:13.757235
6444	9	vote_product	2026-03-15	3	2026-03-15 01:08:18.236925
6445	9	vote_product	2026-03-15	3	2026-03-15 01:08:19.02641
6446	9	vote_product	2026-03-15	3	2026-03-15 01:08:19.143012
162	21	create_collection	2026-03-14	20	2026-03-14 22:47:43.193478
6447	9	vote_product	2026-03-15	3	2026-03-15 01:08:19.726383
6452	8	share_vitrin	2026-03-15	15	2026-03-15 03:29:07.459394
6453	8	create_collection	2026-03-15	20	2026-03-15 03:29:10.66785
6454	8	follow_user	2026-03-15	5	2026-03-15 03:29:13.388774
6455	8	follow_user	2026-03-15	5	2026-03-15 03:29:16.120629
6456	8	follow_user	2026-03-15	5	2026-03-15 03:29:17.488075
6464	8	vote_product	2026-03-15	3	2026-03-15 03:29:26.629052
109	21	vote_product	2026-03-14	3	2026-03-14 22:47:39.710101
110	21	vote_product	2026-03-14	3	2026-03-14 22:47:40.10757
6448	9	vote_product	2026-03-15	3	2026-03-15 01:08:20.078957
6457	8	login	2026-03-15	2	2026-03-15 03:29:18.627267
121	21	vote_product	2026-03-14	3	2026-03-14 22:47:40.652851
6458	8	review_product	2026-03-15	8	2026-03-15 03:29:20.056195
6459	8	review_product	2026-03-15	8	2026-03-15 03:29:21.280281
6460	8	vote_product	2026-03-15	3	2026-03-15 03:29:24.090083
6461	8	vote_product	2026-03-15	3	2026-03-15 03:29:25.445861
6462	8	vote_product	2026-03-15	3	2026-03-15 03:29:25.586733
6463	8	vote_product	2026-03-15	3	2026-03-15 03:29:26.03779
\.


--
-- Data for Name: user_follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_follows (id, follower_id, following_id, created_at) FROM stdin;
1	21	3	2026-03-14 22:38:06.051186
1048	9	21	2026-03-14 23:20:16.820876
1049	9	1	2026-03-15 00:30:53.528212
1051	9	2	2026-03-15 01:41:41.696778
1052	9	472	2026-03-15 01:41:45.036972
1053	9	10	2026-03-15 01:41:57.307924
1054	8	9	2026-03-15 03:32:53.688566
137	21	9	2026-03-14 22:48:25.474845
\.


--
-- Data for Name: user_monthly_earnings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_monthly_earnings (id, user_id, year_month, total_clicks, earnings_amount, status, created_at) FROM stdin;
1	9	2026-03	8	0	pending	2026-03-14 21:03:40.780546
\.


--
-- Data for Name: user_monthly_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_monthly_points (id, user_id, year_month, click_points, activity_points, bonus_points, total_points, multiplier, loyalty_bonus, is_champion, created_at) FROM stdin;
2	21	2026-03	65	113	0	178	1	0	f	2026-03-14 22:39:42.31333
1	9	2026-03	80	226	0	306	1	0	f	2026-03-14 20:03:23.095255
358	8	2026-03	0	113	0	113	1	0	f	2026-03-15 03:28:52.078825
\.


--
-- Data for Name: user_streak; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_streak (id, user_id, current_streak, longest_streak, last_active_date, updated_at) FROM stdin;
3	21	1	1	2026-03-14	2026-03-14 22:35:43.206761
1	8	2	2	2026-03-15	2026-03-15 03:24:45.568
454	524	1	1	2026-03-14	2026-03-14 23:36:52.35878
2	9	2	2	2026-03-15	2026-03-15 00:15:14.127
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.votes (id, product_id, color, session_id, created_at) FROM stdin;
1	4	green	0b84b765-2f2e-4cb8-a96c-73963fcd7a5c	2026-03-14 11:29:18.167074
2	18	green	bot-bot_01-880125	2026-03-14 22:47:37.35626
3	7	red	bot-bot_04-346605	2026-03-14 22:47:37.356462
4	4	yellow	bot-bot_03-266420	2026-03-14 22:47:37.363907
5	17	yellow	bot-bot_02-796985	2026-03-14 22:47:37.365104
6	20	yellow	bot-bot_05-890862	2026-03-14 22:47:37.36783
7	43	yellow	bot-bot_01-638969	2026-03-14 22:47:37.674719
8	24	red	bot-bot_04-766003	2026-03-14 22:47:37.674925
9	20	red	bot-bot_03-848401	2026-03-14 22:47:37.68302
10	8	red	bot-bot_02-862958	2026-03-14 22:47:37.683462
11	2	red	bot-bot_05-666847	2026-03-14 22:47:37.685754
12	2	yellow	bot-bot_01-536945	2026-03-14 22:47:37.993628
13	13	yellow	bot-bot_04-198900	2026-03-14 22:47:37.996388
14	7	red	bot-bot_02-210684	2026-03-14 22:47:38.002574
15	2	yellow	bot-bot_03-496929	2026-03-14 22:47:38.005353
16	20	yellow	bot-bot_05-954927	2026-03-14 22:47:38.00556
17	10	green	bot-bot_01-483894	2026-03-14 22:47:38.309628
18	25	red	bot-bot_04-955220	2026-03-14 22:47:38.311284
19	26	red	bot-bot_02-780785	2026-03-14 22:47:38.322145
20	24	red	bot-bot_03-674768	2026-03-14 22:47:38.322327
21	19	green	bot-bot_05-931328	2026-03-14 22:47:38.323644
22	8	red	bot-bot_01-845723	2026-03-14 22:47:38.638831
23	17	green	bot-bot_04-188292	2026-03-14 22:47:38.640168
24	11	yellow	bot-bot_02-823589	2026-03-14 22:47:38.648407
25	15	red	bot-bot_03-880831	2026-03-14 22:47:38.648865
26	11	red	bot-bot_05-288778	2026-03-14 22:47:38.660042
27	15	green	bot-bot_06-465701	2026-03-14 22:47:42.973077
28	42	yellow	bot-bot_07-796327	2026-03-14 22:47:42.975525
29	21	yellow	bot-bot_09-179022	2026-03-14 22:47:42.978012
31	4	red	bot-bot_08-219989	2026-03-14 22:47:42.979924
32	16	yellow	bot-bot_06-591417	2026-03-14 22:47:43.29174
33	9	red	bot-bot_07-759161	2026-03-14 22:47:43.29302
34	7	red	bot-bot_08-847541	2026-03-14 22:47:43.296641
35	2	green	bot-bot_10-416444	2026-03-14 22:47:43.298453
36	18	red	bot-bot_09-858114	2026-03-14 22:47:43.298631
37	3	yellow	bot-bot_06-603279	2026-03-14 22:47:43.614444
38	1	red	bot-bot_07-944546	2026-03-14 22:47:43.61583
39	13	green	bot-bot_08-109119	2026-03-14 22:47:43.619326
40	17	red	bot-bot_09-302036	2026-03-14 22:47:43.619869
41	7	green	bot-bot_10-821565	2026-03-14 22:47:43.620442
42	14	yellow	bot-bot_06-408417	2026-03-14 22:47:43.93149
43	7	red	bot-bot_07-429272	2026-03-14 22:47:43.932847
44	22	yellow	bot-bot_09-619888	2026-03-14 22:47:43.936298
45	3	red	bot-bot_10-943845	2026-03-14 22:47:43.939232
46	26	yellow	bot-bot_08-337041	2026-03-14 22:47:43.939362
47	21	green	bot-bot_06-808540	2026-03-14 22:47:44.24787
48	18	yellow	bot-bot_07-702815	2026-03-14 22:47:44.250046
49	3	yellow	bot-bot_09-457546	2026-03-14 22:47:44.254445
50	43	green	bot-bot_10-765292	2026-03-14 22:47:44.257848
51	11	yellow	bot-bot_08-303264	2026-03-14 22:47:44.259416
52	12	red	bot-bot_11-929947	2026-03-14 22:47:48.559168
54	21	green	bot-bot_15-993149	2026-03-14 22:47:48.563615
55	18	green	bot-bot_14-801347	2026-03-14 22:47:48.565138
56	13	yellow	bot-bot_12-880098	2026-03-14 22:47:48.566831
57	12	yellow	bot-bot_11-807191	2026-03-14 22:47:48.875309
58	23	green	bot-bot_13-667210	2026-03-14 22:47:48.876507
59	5	green	bot-bot_14-814638	2026-03-14 22:47:48.882861
60	9	yellow	bot-bot_15-367678	2026-03-14 22:47:48.883216
61	21	red	bot-bot_12-243515	2026-03-14 22:47:48.883369
62	4	yellow	bot-bot_11-383305	2026-03-14 22:47:49.192071
63	2	red	bot-bot_13-133456	2026-03-14 22:47:49.192211
64	12	yellow	bot-bot_15-435734	2026-03-14 22:47:49.199522
65	44	green	bot-bot_14-991019	2026-03-14 22:47:49.199753
66	11	red	bot-bot_12-942065	2026-03-14 22:47:49.201278
67	22	green	bot-bot_11-803726	2026-03-14 22:47:49.508658
68	11	red	bot-bot_13-443806	2026-03-14 22:47:49.509941
69	16	yellow	bot-bot_15-127663	2026-03-14 22:47:49.516861
70	44	green	bot-bot_14-528320	2026-03-14 22:47:49.517042
71	19	green	bot-bot_12-441656	2026-03-14 22:47:49.518167
73	15	red	bot-bot_13-618013	2026-03-14 22:47:49.826916
74	8	yellow	bot-bot_14-786102	2026-03-14 22:47:49.833647
75	45	green	bot-bot_12-278297	2026-03-14 22:47:49.835157
76	11	red	bot-bot_15-144098	2026-03-14 22:47:49.837824
77	9	green	bot-bot_16-570579	2026-03-14 22:47:54.140552
78	23	red	bot-bot_19-895076	2026-03-14 22:47:54.141655
79	43	yellow	bot-bot_20-661324	2026-03-14 22:47:54.143523
80	14	yellow	bot-bot_18-154379	2026-03-14 22:47:54.143642
81	44	yellow	bot-bot_17-470249	2026-03-14 22:47:54.145927
82	5	green	bot-bot_16-647600	2026-03-14 22:47:54.460746
83	5	green	bot-bot_19-259875	2026-03-14 22:47:54.460867
84	12	green	bot-bot_18-319203	2026-03-14 22:47:54.462181
85	24	red	bot-bot_20-614537	2026-03-14 22:47:54.463949
86	45	green	bot-bot_17-297141	2026-03-14 22:47:54.465901
87	15	red	bot-bot_16-939398	2026-03-14 22:47:54.778484
88	17	yellow	bot-bot_18-210094	2026-03-14 22:47:54.779769
89	23	green	bot-bot_20-316040	2026-03-14 22:47:54.780185
90	24	green	bot-bot_19-324270	2026-03-14 22:47:54.780461
91	10	red	bot-bot_17-606954	2026-03-14 22:47:54.781785
92	22	yellow	bot-bot_16-352329	2026-03-14 22:47:55.21018
93	20	red	bot-bot_19-692451	2026-03-14 22:47:55.211472
94	19	red	bot-bot_18-312397	2026-03-14 22:47:55.213963
95	11	yellow	bot-bot_20-313537	2026-03-14 22:47:55.214672
96	26	yellow	bot-bot_17-254944	2026-03-14 22:47:55.215282
97	43	green	bot-bot_16-853309	2026-03-14 22:47:55.529621
98	10	green	bot-bot_19-460737	2026-03-14 22:47:55.530927
99	13	yellow	bot-bot_20-816286	2026-03-14 22:47:55.532897
101	44	green	bot-bot_17-831671	2026-03-14 22:47:55.536807
102	11	yellow	bot-bot_21-703890	2026-03-14 22:47:59.845542
103	42	red	bot-bot_25-600713	2026-03-14 22:47:59.845749
104	23	red	bot-bot_22-236284	2026-03-14 22:47:59.847295
105	42	yellow	bot-bot_23-976003	2026-03-14 22:47:59.850365
106	8	red	bot-bot_24-871142	2026-03-14 22:47:59.851436
107	44	red	bot-bot_21-226430	2026-03-14 22:48:00.163192
108	12	red	bot-bot_22-899138	2026-03-14 22:48:00.165323
109	5	green	bot-bot_25-843357	2026-03-14 22:48:00.167948
110	23	red	bot-bot_24-263080	2026-03-14 22:48:00.16811
111	19	red	bot-bot_23-776458	2026-03-14 22:48:00.169609
112	9	red	bot-bot_21-583098	2026-03-14 22:48:00.480751
113	19	red	bot-bot_22-967126	2026-03-14 22:48:00.480881
114	19	yellow	bot-bot_23-260495	2026-03-14 22:48:00.485236
115	16	green	bot-bot_24-613026	2026-03-14 22:48:00.487032
116	14	red	bot-bot_25-334861	2026-03-14 22:48:00.487195
117	20	red	bot-bot_21-430718	2026-03-14 22:48:00.797866
126	13	red	bot-bot_25-335569	2026-03-14 22:48:01.122441
127	23	red	bot-bot_30-146306	2026-03-14 22:48:05.407627
136	44	green	bot-bot_28-177416	2026-03-14 22:48:05.735909
141	5	red	bot-bot_29-462733	2026-03-14 22:48:06.051488
142	12	yellow	bot-bot_30-216257	2026-03-14 22:48:06.357701
151	4	green	bot-bot_28-559793	2026-03-14 22:48:06.684525
1002	13	green	bot-bot_02-129040	2026-03-14 22:59:21.542775
1020	725	yellow	bot-bot_01-651204	2026-03-14 22:59:21.852869
1037	702	red	bot-bot_06-703837	2026-03-14 22:59:23.820413
1054	694	green	bot-bot_13-109999	2026-03-14 22:59:25.735802
1073	711	yellow	bot-bot_15-691568	2026-03-14 22:59:26.135618
1091	726	green	bot-bot_17-986905	2026-03-14 22:59:28.061316
1109	14	red	bot-bot_25-287665	2026-03-14 22:59:30.040456
1126	732	green	bot-bot_21-322026	2026-03-14 22:59:30.341637
1143	694	red	bot-bot_26-416075	2026-03-14 22:59:32.294213
2002	1248	green	anon-1248-m6jqilo7	2026-03-15 03:15:38.05598
1162	755	yellow	bot-bot_35-254206	2026-03-14 22:59:34.249632
1180	654	red	bot-bot_37-173627	2026-03-14 22:59:36.167639
1503	715	green	bot-bot_03-854125	2026-03-14 23:09:25.226396
1520	745	yellow	bot-bot_03-823537	2026-03-14 23:09:25.534163
1524	3	yellow	bot-bot_03-301847	2026-03-14 23:09:25.632001
1543	709	green	bot-bot_10-204207	2026-03-14 23:09:27.588915
1557	2	yellow	bot-bot_15-451599	2026-03-14 23:09:29.473272
1561	4	green	bot-bot_14-773680	2026-03-14 23:09:29.476519
1563	763	red	bot-bot_13-381217	2026-03-14 23:09:29.57391
1570	662	yellow	bot-bot_13-652505	2026-03-14 23:09:29.674444
1577	42	red	bot-bot_20-183763	2026-03-14 23:09:31.432818
1594	665	yellow	bot-bot_16-864715	2026-03-14 23:09:31.732355
1599	13	red	bot-bot_16-669351	2026-03-14 23:09:31.828591
1602	670	yellow	bot-bot_21-828187	2026-03-14 23:09:33.494994
1617	17	yellow	bot-bot_21-114173	2026-03-14 23:09:33.785578
1626	5	yellow	bot-bot_23-270794	2026-03-14 23:09:33.894393
1639	711	yellow	bot-bot_27-334926	2026-03-14 23:09:35.767562
1649	730	yellow	bot-bot_27-735978	2026-03-14 23:09:35.968506
1654	669	green	bot-bot_32-737146	2026-03-14 23:09:37.758408
1660	711	red	bot-bot_32-893297	2026-03-14 23:09:37.892352
1671	740	red	bot-bot_33-901997	2026-03-14 23:09:38.099232
1674	10	yellow	bot-bot_34-782947	2026-03-14 23:09:38.185283
1680	711	red	bot-bot_36-781713	2026-03-14 23:09:40.057082
1683	730	yellow	bot-bot_38-479155	2026-03-14 23:09:40.154029
1695	744	yellow	bot-bot_36-426737	2026-03-14 23:09:40.356338
1698	699	red	bot-bot_38-434732	2026-03-14 23:09:40.452484
1702	741	green	bot-bot_41-624176	2026-03-14 23:09:42.117663
1720	695	red	bot-bot_44-823607	2026-03-14 23:09:42.446713
1726	735	green	bot-bot_42-289097	2026-03-14 23:09:42.545054
1731	662	green	bot-bot_49-759820	2026-03-14 23:09:44.208501
118	12	green	bot-bot_22-270413	2026-03-14 22:48:00.799099
125	19	red	bot-bot_23-759224	2026-03-14 22:48:01.121234
129	16	red	bot-bot_29-626250	2026-03-14 22:48:05.412374
130	2	green	bot-bot_27-792909	2026-03-14 22:48:05.418266
133	45	red	bot-bot_26-743793	2026-03-14 22:48:05.725706
140	3	yellow	bot-bot_28-950750	2026-03-14 22:48:06.049982
144	8	yellow	bot-bot_27-994107	2026-03-14 22:48:06.367299
149	24	red	bot-bot_27-735374	2026-03-14 22:48:06.682547
1003	9	green	bot-bot_04-229271	2026-03-14 22:59:21.546559
1021	693	green	bot-bot_05-878518	2026-03-14 22:59:21.856517
1038	23	green	bot-bot_08-940693	2026-03-14 22:59:23.831896
1056	672	yellow	bot-bot_14-574687	2026-03-14 22:59:25.737512
1092	686	green	bot-bot_16-682679	2026-03-14 22:59:28.149096
1110	22	green	bot-bot_24-223600	2026-03-14 22:59:30.040469
1127	706	red	bot-bot_27-247929	2026-03-14 22:59:31.998279
1163	44	red	bot-bot_34-255430	2026-03-14 22:59:34.257288
1181	17	yellow	bot-bot_36-240376	2026-03-14 22:59:36.184163
1198	744	yellow	bot-bot_39-954655	2026-03-14 22:59:36.547323
2003	45	red	user-9-45	2026-03-15 03:18:13.098755
1516	760	red	bot-bot_05-740888	2026-03-14 23:09:25.433828
1518	683	green	bot-bot_05-502491	2026-03-14 23:09:25.531263
1540	688	yellow	bot-bot_08-273561	2026-03-14 23:09:27.492665
1544	735	red	bot-bot_07-336571	2026-03-14 23:09:27.591023
1558	764	green	bot-bot_11-418134	2026-03-14 23:09:29.473658
1573	728	yellow	bot-bot_11-312552	2026-03-14 23:09:29.772137
1592	689	red	bot-bot_20-545332	2026-03-14 23:09:31.725159
1598	658	red	bot-bot_18-447225	2026-03-14 23:09:31.823358
1603	750	red	bot-bot_24-910076	2026-03-14 23:09:33.498396
1610	705	red	bot-bot_22-488056	2026-03-14 23:09:33.598282
1638	696	green	bot-bot_26-690696	2026-03-14 23:09:35.764452
1648	662	yellow	bot-bot_26-263367	2026-03-14 23:09:35.96814
1658	701	yellow	bot-bot_34-217292	2026-03-14 23:09:37.880682
1676	7	red	bot-bot_33-761750	2026-03-14 23:09:38.197379
1699	755	green	bot-bot_37-321650	2026-03-14 23:09:40.452794
1709	739	green	bot-bot_45-673103	2026-03-14 23:09:42.219325
1717	748	red	bot-bot_41-320600	2026-03-14 23:09:42.43786
119	20	red	bot-bot_24-904181	2026-03-14 22:48:00.802268
124	1	green	bot-bot_24-899028	2026-03-14 22:48:01.119332
131	15	red	bot-bot_28-632554	2026-03-14 22:48:05.418486
132	2	red	bot-bot_30-546953	2026-03-14 22:48:05.72452
138	20	red	bot-bot_26-445297	2026-03-14 22:48:06.040998
145	24	yellow	bot-bot_28-813024	2026-03-14 22:48:06.367653
148	15	green	bot-bot_26-334765	2026-03-14 22:48:06.675033
1004	710	green	bot-bot_05-370997	2026-03-14 22:59:21.546724
1022	749	yellow	bot-bot_04-192803	2026-03-14 22:59:21.951557
2004	44	green	user-9-44	2026-03-15 03:19:26.058451
1057	719	green	bot-bot_12-313080	2026-03-14 22:59:25.829934
1075	8	red	bot-bot_12-510357	2026-03-14 22:59:26.141164
1093	43	red	bot-bot_19-697072	2026-03-14 22:59:28.149311
1111	762	yellow	bot-bot_21-881598	2026-03-14 22:59:30.04606
1128	756	red	bot-bot_26-773468	2026-03-14 22:59:32.004128
1164	7	yellow	bot-bot_32-405952	2026-03-14 22:59:34.259554
1182	721	green	bot-bot_40-613371	2026-03-14 22:59:36.23248
1505	677	yellow	bot-bot_05-191667	2026-03-14 23:09:25.228376
1513	761	green	bot-bot_01-445338	2026-03-14 23:09:25.432926
1538	721	yellow	bot-bot_10-766113	2026-03-14 23:09:27.486866
1546	725	yellow	bot-bot_09-401754	2026-03-14 23:09:27.595102
1553	673	green	bot-bot_13-433572	2026-03-14 23:09:29.375459
1579	726	green	bot-bot_16-181264	2026-03-14 23:09:31.435403
1584	749	red	bot-bot_16-498206	2026-03-14 23:09:31.534358
1588	669	yellow	bot-bot_18-173843	2026-03-14 23:09:31.629718
1601	16	yellow	bot-bot_17-114858	2026-03-14 23:09:31.834648
1608	681	red	bot-bot_24-203040	2026-03-14 23:09:33.593264
1618	1	yellow	bot-bot_24-740486	2026-03-14 23:09:33.78577
1625	680	yellow	bot-bot_25-181748	2026-03-14 23:09:33.894232
1630	694	yellow	bot-bot_28-737383	2026-03-14 23:09:35.565275
1640	739	red	bot-bot_30-978654	2026-03-14 23:09:35.768514
1656	760	yellow	bot-bot_33-303052	2026-03-14 23:09:37.761778
1657	756	red	bot-bot_31-791774	2026-03-14 23:09:37.874379
1661	729	green	bot-bot_33-926295	2026-03-14 23:09:37.898164
1662	654	red	bot-bot_31-551771	2026-03-14 23:09:37.974194
1670	684	green	bot-bot_32-337653	2026-03-14 23:09:38.097849
1675	682	yellow	bot-bot_32-507862	2026-03-14 23:09:38.197188
1678	43	green	bot-bot_38-125790	2026-03-14 23:09:40.053215
1697	690	green	bot-bot_40-869569	2026-03-14 23:09:40.449755
1706	744	green	bot-bot_42-806551	2026-03-14 23:09:42.12096
1736	714	red	bot-bot_46-564199	2026-03-14 23:09:44.307584
1737	688	yellow	bot-bot_50-453352	2026-03-14 23:09:44.400296
120	21	yellow	bot-bot_23-953298	2026-03-14 22:48:00.805063
122	19	red	bot-bot_21-626727	2026-03-14 22:48:01.114178
128	13	green	bot-bot_26-228737	2026-03-14 22:48:05.409206
135	3	green	bot-bot_27-485525	2026-03-14 22:48:05.733325
137	1	green	bot-bot_30-506063	2026-03-14 22:48:06.040854
146	9	red	bot-bot_29-743209	2026-03-14 22:48:06.368854
147	9	red	bot-bot_30-489283	2026-03-14 22:48:06.674878
1005	694	yellow	bot-bot_01-295580	2026-03-14 22:59:21.554618
1023	709	yellow	bot-bot_03-869204	2026-03-14 22:59:21.954832
1040	690	yellow	bot-bot_10-313179	2026-03-14 22:59:23.845186
1058	656	red	bot-bot_11-759070	2026-03-14 22:59:25.83006
1076	736	green	bot-bot_14-680690	2026-03-14 22:59:26.142525
1094	662	red	bot-bot_20-374530	2026-03-14 22:59:28.154488
1112	718	red	bot-bot_22-283134	2026-03-14 22:59:30.13028
1129	672	yellow	bot-bot_30-707765	2026-03-14 22:59:32.013938
1147	759	red	bot-bot_27-762439	2026-03-14 22:59:32.394823
1184	757	yellow	bot-bot_38-511615	2026-03-14 22:59:36.259303
1200	757	green	bot-bot_37-904875	2026-03-14 22:59:36.588183
1519	672	red	bot-bot_01-471290	2026-03-14 23:09:25.531682
1534	650	green	bot-bot_07-584429	2026-03-14 23:09:27.392663
1537	648	red	bot-bot_06-738507	2026-03-14 23:09:27.486018
1549	716	yellow	bot-bot_07-720423	2026-03-14 23:09:27.691801
1559	724	red	bot-bot_13-928513	2026-03-14 23:09:29.47397
1566	736	yellow	bot-bot_14-988156	2026-03-14 23:09:29.577246
1574	16	red	bot-bot_12-622139	2026-03-14 23:09:29.772535
1585	761	yellow	bot-bot_19-148496	2026-03-14 23:09:31.534565
1596	757	green	bot-bot_19-763271	2026-03-14 23:09:31.736674
1620	744	red	bot-bot_25-833604	2026-03-14 23:09:33.7943
1634	659	green	bot-bot_30-103908	2026-03-14 23:09:35.663009
1647	696	yellow	bot-bot_29-531055	2026-03-14 23:09:35.966824
1666	672	green	bot-bot_33-273030	2026-03-14 23:09:37.997132
1668	759	green	bot-bot_35-545259	2026-03-14 23:09:38.08544
1673	659	green	bot-bot_35-262466	2026-03-14 23:09:38.18281
1677	749	red	bot-bot_40-259878	2026-03-14 23:09:40.051978
1693	714	green	bot-bot_37-671220	2026-03-14 23:09:40.352846
1707	729	yellow	bot-bot_41-295751	2026-03-14 23:09:42.216023
1711	750	green	bot-bot_44-549929	2026-03-14 23:09:42.220154
1723	658	yellow	bot-bot_43-288834	2026-03-14 23:09:42.534847
1727	665	yellow	bot-bot_50-571440	2026-03-14 23:09:44.20238
121	4	green	bot-bot_25-100992	2026-03-14 22:48:00.805319
123	11	red	bot-bot_22-299698	2026-03-14 22:48:01.114311
134	19	red	bot-bot_29-690467	2026-03-14 22:48:05.732957
139	13	yellow	bot-bot_27-861287	2026-03-14 22:48:06.049565
143	43	red	bot-bot_26-626337	2026-03-14 22:48:06.357894
150	19	green	bot-bot_29-796452	2026-03-14 22:48:06.68435
152	42	red	bot-bot_31-828834	2026-03-14 22:48:10.974163
153	21	yellow	bot-bot_32-879867	2026-03-14 22:48:10.974305
154	25	yellow	bot-bot_34-202490	2026-03-14 22:48:10.974451
155	2	red	bot-bot_35-537517	2026-03-14 22:48:10.976478
156	5	green	bot-bot_33-646973	2026-03-14 22:48:10.978879
157	13	red	bot-bot_31-244978	2026-03-14 22:48:11.311019
158	7	red	bot-bot_32-705340	2026-03-14 22:48:11.311167
159	15	green	bot-bot_34-811811	2026-03-14 22:48:11.3113
160	4	yellow	bot-bot_35-145219	2026-03-14 22:48:11.3197
161	42	green	bot-bot_33-423371	2026-03-14 22:48:11.321065
162	2	red	bot-bot_31-558763	2026-03-14 22:48:11.628126
163	45	yellow	bot-bot_34-557821	2026-03-14 22:48:11.628666
164	20	yellow	bot-bot_32-291457	2026-03-14 22:48:11.628905
165	25	green	bot-bot_33-963467	2026-03-14 22:48:11.634943
166	4	red	bot-bot_35-305030	2026-03-14 22:48:11.636409
167	2	red	bot-bot_31-557849	2026-03-14 22:48:11.945755
168	17	green	bot-bot_32-437689	2026-03-14 22:48:11.947244
169	24	red	bot-bot_34-998545	2026-03-14 22:48:11.950357
170	15	yellow	bot-bot_35-275787	2026-03-14 22:48:11.952011
171	16	yellow	bot-bot_33-140787	2026-03-14 22:48:11.953677
172	16	red	bot-bot_31-443032	2026-03-14 22:48:12.26356
173	16	red	bot-bot_32-773101	2026-03-14 22:48:12.263795
174	3	red	bot-bot_35-274847	2026-03-14 22:48:12.268581
175	13	yellow	bot-bot_34-939647	2026-03-14 22:48:12.269263
176	8	red	bot-bot_33-304487	2026-03-14 22:48:12.271018
177	43	yellow	bot-bot_36-892341	2026-03-14 22:48:16.553467
178	14	yellow	bot-bot_38-952713	2026-03-14 22:48:16.55351
179	10	green	bot-bot_39-437020	2026-03-14 22:48:16.561271
180	25	red	bot-bot_40-941080	2026-03-14 22:48:16.562789
181	11	red	bot-bot_37-761721	2026-03-14 22:48:16.564235
182	26	red	bot-bot_36-212113	2026-03-14 22:48:16.868762
183	16	yellow	bot-bot_38-263187	2026-03-14 22:48:16.869801
184	11	red	bot-bot_39-912276	2026-03-14 22:48:16.879513
185	42	red	bot-bot_40-885267	2026-03-14 22:48:16.879801
186	44	yellow	bot-bot_37-734815	2026-03-14 22:48:16.879947
187	19	green	bot-bot_36-872889	2026-03-14 22:48:17.185244
188	26	green	bot-bot_38-166197	2026-03-14 22:48:17.186656
189	24	yellow	bot-bot_40-766687	2026-03-14 22:48:17.195883
190	13	red	bot-bot_39-873560	2026-03-14 22:48:17.198019
191	24	red	bot-bot_37-794617	2026-03-14 22:48:17.198043
192	19	red	bot-bot_36-608874	2026-03-14 22:48:17.501901
193	4	yellow	bot-bot_38-949438	2026-03-14 22:48:17.501996
194	3	green	bot-bot_40-573923	2026-03-14 22:48:17.511961
195	24	yellow	bot-bot_39-216125	2026-03-14 22:48:17.515069
196	20	yellow	bot-bot_37-777097	2026-03-14 22:48:17.515654
197	44	red	bot-bot_36-488558	2026-03-14 22:48:17.817425
198	14	red	bot-bot_38-718767	2026-03-14 22:48:17.817573
199	45	yellow	bot-bot_40-923695	2026-03-14 22:48:17.825731
200	13	yellow	bot-bot_37-891841	2026-03-14 22:48:17.830076
201	18	green	bot-bot_39-699556	2026-03-14 22:48:17.832583
202	26	green	bot-bot_41-968775	2026-03-14 22:48:22.116962
203	20	red	bot-bot_45-859080	2026-03-14 22:48:22.118076
204	8	red	bot-bot_42-185115	2026-03-14 22:48:22.121478
205	13	red	bot-bot_43-314099	2026-03-14 22:48:22.121642
206	44	yellow	bot-bot_44-296006	2026-03-14 22:48:22.123089
207	45	yellow	bot-bot_41-222657	2026-03-14 22:48:22.433456
208	7	yellow	bot-bot_45-518257	2026-03-14 22:48:22.434837
209	22	yellow	bot-bot_43-149855	2026-03-14 22:48:22.438751
210	44	green	bot-bot_44-135935	2026-03-14 22:48:22.440381
211	1	yellow	bot-bot_42-975459	2026-03-14 22:48:22.440511
212	42	red	bot-bot_41-249025	2026-03-14 22:48:22.748553
213	1	red	bot-bot_45-215861	2026-03-14 22:48:22.750799
214	8	red	bot-bot_43-688296	2026-03-14 22:48:22.752381
215	5	red	bot-bot_42-914990	2026-03-14 22:48:22.755753
216	25	green	bot-bot_44-104663	2026-03-14 22:48:22.755895
217	14	red	bot-bot_41-691986	2026-03-14 22:48:23.067652
218	6	red	bot-bot_45-644980	2026-03-14 22:48:23.067875
219	18	yellow	bot-bot_43-420495	2026-03-14 22:48:23.071525
220	11	red	bot-bot_42-778775	2026-03-14 22:48:23.071976
224	19	yellow	bot-bot_43-451668	2026-03-14 22:48:23.393107
225	2	yellow	bot-bot_42-460814	2026-03-14 22:48:23.393372
226	13	yellow	bot-bot_44-780421	2026-03-14 22:48:23.394889
228	42	green	bot-bot_47-169925	2026-03-14 22:48:27.692676
229	45	yellow	bot-bot_50-513703	2026-03-14 22:48:27.693042
230	6	yellow	bot-bot_46-144347	2026-03-14 22:48:27.695299
231	12	yellow	bot-bot_49-537253	2026-03-14 22:48:27.697103
232	42	green	bot-bot_48-617268	2026-03-14 22:48:28.009163
233	23	red	bot-bot_47-555943	2026-03-14 22:48:28.010111
234	11	yellow	bot-bot_50-440739	2026-03-14 22:48:28.010382
235	3	green	bot-bot_46-517126	2026-03-14 22:48:28.012095
236	44	yellow	bot-bot_49-806794	2026-03-14 22:48:28.014052
237	5	red	bot-bot_48-378398	2026-03-14 22:48:28.329322
238	11	yellow	bot-bot_47-502983	2026-03-14 22:48:28.329459
239	18	green	bot-bot_46-609549	2026-03-14 22:48:28.329604
240	26	red	bot-bot_50-108792	2026-03-14 22:48:28.329771
241	14	red	bot-bot_49-559734	2026-03-14 22:48:28.330669
242	20	red	bot-bot_48-346832	2026-03-14 22:48:28.645475
243	17	yellow	bot-bot_49-796220	2026-03-14 22:48:28.645645
244	5	yellow	bot-bot_46-183512	2026-03-14 22:48:28.647723
245	19	red	bot-bot_47-242709	2026-03-14 22:48:28.648286
246	25	green	bot-bot_50-573049	2026-03-14 22:48:28.648462
247	24	red	bot-bot_48-624375	2026-03-14 22:48:28.963036
248	18	green	bot-bot_49-421223	2026-03-14 22:48:28.964492
249	26	green	bot-bot_46-374842	2026-03-14 22:48:28.966149
250	43	yellow	bot-bot_50-312379	2026-03-14 22:48:28.966601
251	8	red	bot-bot_47-156336	2026-03-14 22:48:28.967355
252	24	green	bot-bot_03-689188	2026-03-14 22:53:15.212035
253	44	yellow	bot-bot_02-114851	2026-03-14 22:53:15.212175
254	22	green	bot-bot_04-265661	2026-03-14 22:53:15.213604
255	7	green	bot-bot_05-443213	2026-03-14 22:53:15.214019
256	26	yellow	bot-bot_01-749435	2026-03-14 22:53:15.215745
257	3	yellow	bot-bot_03-519855	2026-03-14 22:53:15.532015
258	23	yellow	bot-bot_05-260517	2026-03-14 22:53:15.532157
259	24	green	bot-bot_04-143879	2026-03-14 22:53:15.532256
264	42	green	bot-bot_05-705966	2026-03-14 22:53:15.854364
260	24	yellow	bot-bot_02-350868	2026-03-14 22:53:15.533876
261	17	green	bot-bot_01-382656	2026-03-14 22:53:15.536974
262	7	red	bot-bot_03-487783	2026-03-14 22:53:15.851484
263	25	yellow	bot-bot_02-571079	2026-03-14 22:53:15.853816
265	6	red	bot-bot_04-462364	2026-03-14 22:53:15.857172
267	2	yellow	bot-bot_03-476924	2026-03-14 22:53:16.174984
271	24	green	bot-bot_01-928107	2026-03-14 22:53:16.17888
273	3	green	bot-bot_03-174509	2026-03-14 22:53:16.495671
275	42	yellow	bot-bot_05-943804	2026-03-14 22:53:16.497709
279	4	red	bot-bot_07-614401	2026-03-14 22:53:20.851413
280	22	yellow	bot-bot_10-181878	2026-03-14 22:53:20.855247
281	2	green	bot-bot_09-220195	2026-03-14 22:53:20.857541
282	6	red	bot-bot_06-167364	2026-03-14 22:53:21.167969
284	43	red	bot-bot_08-968114	2026-03-14 22:53:21.171874
285	11	red	bot-bot_10-313391	2026-03-14 22:53:21.175183
288	15	green	bot-bot_07-784446	2026-03-14 22:53:21.489827
289	5	red	bot-bot_10-790250	2026-03-14 22:53:21.491944
294	43	red	bot-bot_08-900013	2026-03-14 22:53:21.812844
295	2	green	bot-bot_10-947190	2026-03-14 22:53:21.812997
297	26	yellow	bot-bot_06-850239	2026-03-14 22:53:22.131509
300	42	red	bot-bot_08-578839	2026-03-14 22:53:22.135493
305	42	green	bot-bot_15-308090	2026-03-14 22:53:26.487107
308	22	red	bot-bot_13-801962	2026-03-14 22:53:26.804424
311	43	red	bot-bot_14-681739	2026-03-14 22:53:26.809314
313	45	yellow	bot-bot_13-289762	2026-03-14 22:53:27.125142
315	24	green	bot-bot_14-623955	2026-03-14 22:53:27.126985
318	12	red	bot-bot_15-618523	2026-03-14 22:53:27.444928
321	1	yellow	bot-bot_14-140072	2026-03-14 22:53:27.447173
322	17	yellow	bot-bot_11-708505	2026-03-14 22:53:27.762947
325	44	red	bot-bot_14-506226	2026-03-14 22:53:27.766085
326	8	yellow	bot-bot_12-222917	2026-03-14 22:53:27.766652
331	11	green	bot-bot_17-405728	2026-03-14 22:53:32.127311
334	4	red	bot-bot_19-920867	2026-03-14 22:53:32.440291
339	26	yellow	bot-bot_18-687498	2026-03-14 22:53:32.757943
344	4	yellow	bot-bot_18-317751	2026-03-14 22:53:33.077839
346	11	red	bot-bot_19-189116	2026-03-14 22:53:33.080274
347	25	red	bot-bot_16-198830	2026-03-14 22:53:33.389739
349	12	green	bot-bot_17-163561	2026-03-14 22:53:33.396089
354	3	yellow	bot-bot_25-496465	2026-03-14 22:53:38.210927
360	21	green	bot-bot_23-888245	2026-03-14 22:53:38.532099
365	17	red	bot-bot_22-833205	2026-03-14 22:53:38.849713
370	16	green	bot-bot_22-607544	2026-03-14 22:53:39.165484
375	1	yellow	bot-bot_22-333954	2026-03-14 22:53:39.482854
378	22	red	bot-bot_30-339218	2026-03-14 22:53:43.773432
386	18	green	bot-bot_27-267250	2026-03-14 22:53:44.095612
388	4	red	bot-bot_30-311626	2026-03-14 22:53:44.411439
391	25	green	bot-bot_26-137387	2026-03-14 22:53:44.414283
393	44	yellow	bot-bot_30-640713	2026-03-14 22:53:44.728016
395	25	red	bot-bot_29-822263	2026-03-14 22:53:44.73382
397	17	green	bot-bot_28-806168	2026-03-14 22:53:45.043104
400	19	red	bot-bot_29-356201	2026-03-14 22:53:45.05074
404	14	red	bot-bot_32-617113	2026-03-14 22:53:49.34787
405	15	red	bot-bot_34-655178	2026-03-14 22:53:49.348808
409	7	yellow	bot-bot_34-948793	2026-03-14 22:53:49.667343
411	17	red	bot-bot_33-218611	2026-03-14 22:53:49.668071
413	15	green	bot-bot_31-471331	2026-03-14 22:53:49.973491
414	20	yellow	bot-bot_34-356057	2026-03-14 22:53:49.983357
420	4	red	bot-bot_32-905877	2026-03-14 22:53:50.30089
421	19	red	bot-bot_33-137059	2026-03-14 22:53:50.302251
422	6	red	bot-bot_35-765478	2026-03-14 22:53:50.607114
423	24	yellow	bot-bot_31-242895	2026-03-14 22:53:50.607267
430	22	yellow	bot-bot_38-664847	2026-03-14 22:53:54.906599
431	13	red	bot-bot_37-309240	2026-03-14 22:53:54.906772
432	19	red	bot-bot_36-439783	2026-03-14 22:53:55.216539
433	12	green	bot-bot_39-242979	2026-03-14 22:53:55.220062
434	12	yellow	bot-bot_40-232551	2026-03-14 22:53:55.221076
439	19	green	bot-bot_39-946000	2026-03-14 22:53:55.541047
440	44	green	bot-bot_37-208373	2026-03-14 22:53:55.543374
443	44	red	bot-bot_40-480787	2026-03-14 22:53:55.857372
444	18	yellow	bot-bot_39-958606	2026-03-14 22:53:55.859009
446	26	green	bot-bot_38-430755	2026-03-14 22:53:55.861643
447	26	red	bot-bot_36-524538	2026-03-14 22:53:56.172439
453	43	yellow	bot-bot_41-108873	2026-03-14 22:54:00.4902
456	7	green	bot-bot_42-254109	2026-03-14 22:54:00.495263
457	22	green	bot-bot_45-232719	2026-03-14 22:54:00.80763
459	7	green	bot-bot_44-390395	2026-03-14 22:54:00.813726
463	8	green	bot-bot_41-397067	2026-03-14 22:54:01.125082
466	22	red	bot-bot_43-903950	2026-03-14 22:54:01.133852
470	19	green	bot-bot_44-507023	2026-03-14 22:54:01.449885
471	45	red	bot-bot_42-778734	2026-03-14 22:54:01.451234
472	16	yellow	bot-bot_45-238694	2026-03-14 22:54:01.754936
476	43	green	bot-bot_42-282444	2026-03-14 22:54:01.768763
478	13	green	bot-bot_48-373224	2026-03-14 22:54:06.0515
482	14	green	bot-bot_46-494990	2026-03-14 22:54:06.368657
486	45	red	bot-bot_47-230384	2026-03-14 22:54:06.371451
487	8	red	bot-bot_46-446773	2026-03-14 22:54:06.685706
491	15	red	bot-bot_47-369855	2026-03-14 22:54:06.690599
492	20	green	bot-bot_46-820731	2026-03-14 22:54:07.004535
496	21	green	bot-bot_49-761874	2026-03-14 22:54:07.009704
497	10	green	bot-bot_46-396950	2026-03-14 22:54:07.322447
501	10	yellow	bot-bot_49-128049	2026-03-14 22:54:07.328316
1006	765	red	bot-bot_03-130185	2026-03-14 22:59:21.55938
1024	736	red	bot-bot_01-371459	2026-03-14 22:59:21.956495
1041	713	green	bot-bot_07-432126	2026-03-14 22:59:23.856852
1059	727	yellow	bot-bot_15-443345	2026-03-14 22:59:25.838538
1077	710	red	bot-bot_20-255433	2026-03-14 22:59:27.843289
1095	6	red	bot-bot_18-525069	2026-03-14 22:59:28.171315
1113	664	green	bot-bot_23-291666	2026-03-14 22:59:30.132605
1130	732	red	bot-bot_28-976539	2026-03-14 22:59:32.019372
1148	759	green	bot-bot_28-767773	2026-03-14 22:59:32.397543
1166	654	red	bot-bot_33-307572	2026-03-14 22:59:34.269608
1183	12	yellow	bot-bot_39-162640	2026-03-14 22:59:36.259191
1578	721	red	bot-bot_18-154336	2026-03-14 23:09:31.435229
1581	712	red	bot-bot_19-763577	2026-03-14 23:09:31.438902
1590	12	yellow	bot-bot_19-883306	2026-03-14 23:09:31.637219
1600	700	yellow	bot-bot_19-450645	2026-03-14 23:09:31.832801
1612	699	yellow	bot-bot_21-732499	2026-03-14 23:09:33.688805
1621	758	red	bot-bot_23-522420	2026-03-14 23:09:33.794631
266	22	yellow	bot-bot_01-603088	2026-03-14 22:53:15.857387
268	42	red	bot-bot_02-111963	2026-03-14 22:53:16.175162
274	25	yellow	bot-bot_02-222981	2026-03-14 22:53:16.497331
278	15	red	bot-bot_08-673658	2026-03-14 22:53:20.851198
286	26	green	bot-bot_09-616876	2026-03-14 22:53:21.1757
287	5	red	bot-bot_06-579057	2026-03-14 22:53:21.48853
290	16	red	bot-bot_08-257657	2026-03-14 22:53:21.492097
293	15	red	bot-bot_07-301606	2026-03-14 22:53:21.812612
299	19	red	bot-bot_10-483806	2026-03-14 22:53:22.133577
306	10	red	bot-bot_14-819479	2026-03-14 22:53:26.489463
307	2	yellow	bot-bot_11-552808	2026-03-14 22:53:26.804241
316	18	red	bot-bot_12-215201	2026-03-14 22:53:27.127432
317	9	red	bot-bot_11-590963	2026-03-14 22:53:27.443437
320	14	green	bot-bot_12-408984	2026-03-14 22:53:27.446868
323	9	green	bot-bot_13-950627	2026-03-14 22:53:27.763744
328	43	yellow	bot-bot_20-147377	2026-03-14 22:53:32.116614
340	12	green	bot-bot_19-940999	2026-03-14 22:53:32.759834
343	9	red	bot-bot_20-490528	2026-03-14 22:53:33.073064
350	11	green	bot-bot_18-845174	2026-03-14 22:53:33.399008
352	18	red	bot-bot_24-766203	2026-03-14 22:53:38.170329
353	5	red	bot-bot_21-738378	2026-03-14 22:53:38.202419
384	23	green	bot-bot_29-324862	2026-03-14 22:53:44.09391
387	6	yellow	bot-bot_28-350623	2026-03-14 22:53:44.409076
396	2	yellow	bot-bot_26-983621	2026-03-14 22:53:44.734259
398	42	green	bot-bot_30-437622	2026-03-14 22:53:45.045405
402	15	yellow	bot-bot_35-789662	2026-03-14 22:53:49.33939
410	1	red	bot-bot_32-834815	2026-03-14 22:53:49.66778
412	15	green	bot-bot_35-838325	2026-03-14 22:53:49.972414
419	9	red	bot-bot_34-415549	2026-03-14 22:53:50.298144
424	21	red	bot-bot_34-496314	2026-03-14 22:53:50.615082
441	9	green	bot-bot_38-219425	2026-03-14 22:53:55.545018
442	6	red	bot-bot_36-744142	2026-03-14 22:53:55.856367
451	44	green	bot-bot_37-359067	2026-03-14 22:53:56.178019
454	14	yellow	bot-bot_44-346292	2026-03-14 22:54:00.490342
460	15	red	bot-bot_42-957041	2026-03-14 22:54:00.815119
468	11	green	bot-bot_41-146476	2026-03-14 22:54:01.4396
475	44	green	bot-bot_43-913427	2026-03-14 22:54:01.766153
480	2	yellow	bot-bot_49-579908	2026-03-14 22:54:06.053324
483	10	red	bot-bot_50-684575	2026-03-14 22:54:06.370605
490	26	red	bot-bot_49-832513	2026-03-14 22:54:06.690285
493	24	green	bot-bot_48-437263	2026-03-14 22:54:07.005603
499	11	red	bot-bot_50-416248	2026-03-14 22:54:07.324896
1007	684	green	bot-bot_02-533215	2026-03-14 22:59:21.64235
1008	692	green	bot-bot_03-536920	2026-03-14 22:59:21.646904
1025	676	green	bot-bot_02-962592	2026-03-14 22:59:21.956721
1042	722	green	bot-bot_06-671207	2026-03-14 22:59:23.915729
1043	655	yellow	bot-bot_08-460221	2026-03-14 22:59:23.919346
1060	691	yellow	bot-bot_13-780957	2026-03-14 22:59:25.840485
1078	689	yellow	bot-bot_16-278367	2026-03-14 22:59:27.844503
1096	749	yellow	bot-bot_17-526622	2026-03-14 22:59:28.17361
1149	654	red	bot-bot_30-683888	2026-03-14 22:59:32.403933
1167	15	green	bot-bot_35-670204	2026-03-14 22:59:34.347506
1185	669	yellow	bot-bot_37-913262	2026-03-14 22:59:36.274298
1202	674	green	bot-bot_44-781732	2026-03-14 22:59:38.229703
1214	663	yellow	bot-bot_43-190877	2026-03-14 22:59:38.429528
1220	758	green	bot-bot_43-281991	2026-03-14 22:59:38.529957
1224	661	yellow	bot-bot_42-620688	2026-03-14 22:59:38.629583
1235	705	green	bot-bot_48-312840	2026-03-14 22:59:40.560999
1237	757	green	bot-bot_46-415402	2026-03-14 22:59:40.652958
1238	763	yellow	bot-bot_49-571977	2026-03-14 22:59:40.656185
1622	686	green	bot-bot_21-360354	2026-03-14 23:09:33.884969
1641	23	green	bot-bot_28-344655	2026-03-14 23:09:35.769566
1643	20	red	bot-bot_26-836968	2026-03-14 23:09:35.866811
1650	4	red	bot-bot_30-343544	2026-03-14 23:09:35.973203
1664	8	yellow	bot-bot_34-585135	2026-03-14 23:09:37.986249
1669	759	green	bot-bot_34-124630	2026-03-14 23:09:38.087074
1692	653	yellow	bot-bot_40-633870	2026-03-14 23:09:40.351408
1703	747	yellow	bot-bot_43-482148	2026-03-14 23:09:42.118742
1713	753	green	bot-bot_43-227010	2026-03-14 23:09:42.3163
1734	713	green	bot-bot_47-381480	2026-03-14 23:09:44.302279
1740	713	green	bot-bot_49-273485	2026-03-14 23:09:44.403422
1744	715	red	bot-bot_48-363430	2026-03-14 23:09:44.501309
269	25	red	bot-bot_05-865262	2026-03-14 22:53:16.175923
276	13	yellow	bot-bot_01-673360	2026-03-14 22:53:16.498018
291	14	yellow	bot-bot_09-461366	2026-03-14 22:53:21.493408
292	44	green	bot-bot_06-872850	2026-03-14 22:53:21.811392
301	15	red	bot-bot_09-533377	2026-03-14 22:53:22.136053
303	44	green	bot-bot_13-747151	2026-03-14 22:53:26.484061
310	26	green	bot-bot_12-237537	2026-03-14 22:53:26.807739
314	15	yellow	bot-bot_15-544004	2026-03-14 22:53:27.125475
319	43	green	bot-bot_13-931314	2026-03-14 22:53:27.445228
324	21	red	bot-bot_15-756199	2026-03-14 22:53:27.763923
330	16	green	bot-bot_18-187123	2026-03-14 22:53:32.12414
333	4	green	bot-bot_20-452071	2026-03-14 22:53:32.434176
335	15	green	bot-bot_18-247063	2026-03-14 22:53:32.440994
336	20	green	bot-bot_17-363447	2026-03-14 22:53:32.445186
337	18	red	bot-bot_16-935643	2026-03-14 22:53:32.752579
338	19	red	bot-bot_20-589344	2026-03-14 22:53:32.756155
345	4	red	bot-bot_17-596797	2026-03-14 22:53:33.077983
348	9	red	bot-bot_20-486197	2026-03-14 22:53:33.390582
355	17	yellow	bot-bot_23-394425	2026-03-14 22:53:38.212436
357	44	green	bot-bot_24-700148	2026-03-14 22:53:38.485759
358	42	green	bot-bot_21-109864	2026-03-14 22:53:38.518652
361	25	red	bot-bot_22-841885	2026-03-14 22:53:38.532361
362	45	red	bot-bot_24-709605	2026-03-14 22:53:38.801422
363	26	yellow	bot-bot_21-645516	2026-03-14 22:53:38.834061
364	10	red	bot-bot_25-357827	2026-03-14 22:53:38.847135
371	13	yellow	bot-bot_23-403966	2026-03-14 22:53:39.169676
372	23	green	bot-bot_24-465021	2026-03-14 22:53:39.432397
373	12	red	bot-bot_21-236856	2026-03-14 22:53:39.460901
374	1	yellow	bot-bot_25-130461	2026-03-14 22:53:39.480098
377	45	green	bot-bot_28-378680	2026-03-14 22:53:43.773331
380	17	red	bot-bot_26-711768	2026-03-14 22:53:43.777313
383	16	red	bot-bot_30-157622	2026-03-14 22:53:44.092111
390	43	yellow	bot-bot_27-187172	2026-03-14 22:53:44.414005
394	26	green	bot-bot_27-519774	2026-03-14 22:53:44.732223
399	6	green	bot-bot_27-276632	2026-03-14 22:53:45.049539
403	7	red	bot-bot_31-322552	2026-03-14 22:53:49.340915
407	45	yellow	bot-bot_35-311460	2026-03-14 22:53:49.655898
416	21	yellow	bot-bot_33-884266	2026-03-14 22:53:49.98639
417	7	green	bot-bot_35-343812	2026-03-14 22:53:50.289608
426	4	green	bot-bot_33-735778	2026-03-14 22:53:50.620393
427	45	yellow	bot-bot_36-452873	2026-03-14 22:53:54.900298
436	26	green	bot-bot_38-883418	2026-03-14 22:53:55.224424
437	20	yellow	bot-bot_36-500434	2026-03-14 22:53:55.538605
450	7	red	bot-bot_38-638269	2026-03-14 22:53:56.177875
455	4	yellow	bot-bot_43-439464	2026-03-14 22:54:00.494872
458	16	green	bot-bot_41-378545	2026-03-14 22:54:00.808791
465	19	green	bot-bot_42-719461	2026-03-14 22:54:01.133582
469	13	green	bot-bot_43-972874	2026-03-14 22:54:01.449693
474	11	yellow	bot-bot_44-205172	2026-03-14 22:54:01.764839
479	21	yellow	bot-bot_50-989682	2026-03-14 22:54:06.053077
484	20	green	bot-bot_48-400820	2026-03-14 22:54:06.370995
488	14	red	bot-bot_50-160966	2026-03-14 22:54:06.687215
494	12	yellow	bot-bot_50-404391	2026-03-14 22:54:07.005914
500	8	green	bot-bot_47-367871	2026-03-14 22:54:07.327639
1009	670	green	bot-bot_05-754953	2026-03-14 22:59:21.649938
1026	648	yellow	bot-bot_05-927016	2026-03-14 22:59:21.96044
1044	718	red	bot-bot_09-487517	2026-03-14 22:59:23.939781
1061	751	green	bot-bot_14-259829	2026-03-14 22:59:25.840572
1079	706	green	bot-bot_17-989895	2026-03-14 22:59:27.857439
1097	682	green	bot-bot_16-188110	2026-03-14 22:59:28.246761
1115	756	yellow	bot-bot_24-195428	2026-03-14 22:59:30.140598
1132	752	yellow	bot-bot_27-184513	2026-03-14 22:59:32.095986
1150	747	red	bot-bot_26-427918	2026-03-14 22:59:32.407013
1169	690	red	bot-bot_34-239466	2026-03-14 22:59:34.35379
1186	25	yellow	bot-bot_36-684772	2026-03-14 22:59:36.280067
1203	731	yellow	bot-bot_41-101807	2026-03-14 22:59:38.231947
1211	22	red	bot-bot_45-607314	2026-03-14 22:59:38.333025
1212	670	red	bot-bot_41-954157	2026-03-14 22:59:38.427959
1221	23	yellow	bot-bot_45-689086	2026-03-14 22:59:38.533698
1222	16	red	bot-bot_41-393752	2026-03-14 22:59:38.622669
1236	44	green	bot-bot_50-248795	2026-03-14 22:59:40.561251
1239	680	red	bot-bot_48-433391	2026-03-14 22:59:40.657554
1244	42	green	bot-bot_48-804939	2026-03-14 22:59:40.754363
1245	725	red	bot-bot_47-293661	2026-03-14 22:59:40.804724
1248	679	red	bot-bot_49-459107	2026-03-14 22:59:40.851927
1730	16	yellow	bot-bot_46-486074	2026-03-14 23:09:44.208305
1735	743	yellow	bot-bot_49-148936	2026-03-14 23:09:44.307034
1738	741	green	bot-bot_48-661106	2026-03-14 23:09:44.400431
1743	646	red	bot-bot_47-972127	2026-03-14 23:09:44.501124
1750	662	green	bot-bot_49-549727	2026-03-14 23:09:44.602444
270	23	yellow	bot-bot_04-262037	2026-03-14 22:53:16.177115
277	17	red	bot-bot_06-760325	2026-03-14 22:53:20.849754
296	22	red	bot-bot_09-436271	2026-03-14 22:53:21.813488
298	16	red	bot-bot_07-851001	2026-03-14 22:53:22.133251
302	8	yellow	bot-bot_11-664406	2026-03-14 22:53:26.482971
304	22	yellow	bot-bot_12-456379	2026-03-14 22:53:26.48687
309	20	yellow	bot-bot_15-328845	2026-03-14 22:53:26.806917
312	21	red	bot-bot_11-550562	2026-03-14 22:53:27.12373
327	42	green	bot-bot_16-828439	2026-03-14 22:53:32.115301
332	17	green	bot-bot_16-353636	2026-03-14 22:53:32.434003
342	20	green	bot-bot_16-565284	2026-03-14 22:53:33.070938
356	21	green	bot-bot_22-440028	2026-03-14 22:53:38.212754
359	45	yellow	bot-bot_25-232887	2026-03-14 22:53:38.529475
366	19	red	bot-bot_23-348766	2026-03-14 22:53:38.850046
367	17	red	bot-bot_24-196752	2026-03-14 22:53:39.117332
368	5	green	bot-bot_21-921608	2026-03-14 22:53:39.147361
369	23	yellow	bot-bot_25-814017	2026-03-14 22:53:39.164997
376	44	red	bot-bot_23-313494	2026-03-14 22:53:39.484362
379	1	red	bot-bot_29-928627	2026-03-14 22:53:43.773518
381	17	red	bot-bot_27-441685	2026-03-14 22:53:43.779046
382	43	yellow	bot-bot_28-525377	2026-03-14 22:53:44.090907
385	12	green	bot-bot_26-636357	2026-03-14 22:53:44.094155
389	14	yellow	bot-bot_29-160047	2026-03-14 22:53:44.413838
392	15	green	bot-bot_28-748858	2026-03-14 22:53:44.725873
401	14	yellow	bot-bot_26-521100	2026-03-14 22:53:45.052447
406	26	green	bot-bot_33-867264	2026-03-14 22:53:49.349216
408	1	yellow	bot-bot_31-902198	2026-03-14 22:53:49.657988
415	45	yellow	bot-bot_32-390572	2026-03-14 22:53:49.984894
418	19	red	bot-bot_31-202264	2026-03-14 22:53:50.289944
425	45	yellow	bot-bot_32-439244	2026-03-14 22:53:50.6178
428	44	red	bot-bot_39-186378	2026-03-14 22:53:54.902433
438	10	yellow	bot-bot_40-292620	2026-03-14 22:53:55.540777
445	12	red	bot-bot_37-324627	2026-03-14 22:53:55.85911
449	24	yellow	bot-bot_39-448753	2026-03-14 22:53:56.177745
452	11	red	bot-bot_45-665448	2026-03-14 22:54:00.490041
461	42	yellow	bot-bot_43-935065	2026-03-14 22:54:00.815476
462	43	yellow	bot-bot_45-918004	2026-03-14 22:54:01.123149
467	19	green	bot-bot_45-599817	2026-03-14 22:54:01.439458
473	21	green	bot-bot_41-350552	2026-03-14 22:54:01.756159
477	13	red	bot-bot_46-178527	2026-03-14 22:54:06.050436
481	4	red	bot-bot_47-688256	2026-03-14 22:54:06.054837
485	11	yellow	bot-bot_49-780241	2026-03-14 22:54:06.371113
489	21	green	bot-bot_48-284963	2026-03-14 22:54:06.688577
495	2	yellow	bot-bot_47-916662	2026-03-14 22:54:07.007342
498	16	green	bot-bot_48-302364	2026-03-14 22:54:07.324697
502	21	green	bot-bot_03-430286	2026-03-14 22:55:39.441348
503	24	red	bot-bot_02-264351	2026-03-14 22:55:39.442722
504	5	yellow	bot-bot_05-455031	2026-03-14 22:55:39.443169
505	14	yellow	bot-bot_01-321291	2026-03-14 22:55:39.443608
506	6	red	bot-bot_04-499628	2026-03-14 22:55:39.445178
507	22	yellow	bot-bot_05-835178	2026-03-14 22:55:39.54093
508	44	yellow	bot-bot_03-770513	2026-03-14 22:55:39.541056
509	43	red	bot-bot_02-827831	2026-03-14 22:55:39.54122
510	5	yellow	bot-bot_01-369526	2026-03-14 22:55:39.54207
511	10	red	bot-bot_04-135705	2026-03-14 22:55:39.544567
512	12	yellow	bot-bot_05-390761	2026-03-14 22:55:39.6392
513	23	red	bot-bot_01-356941	2026-03-14 22:55:39.639298
514	26	red	bot-bot_02-231372	2026-03-14 22:55:39.640896
515	23	yellow	bot-bot_04-507429	2026-03-14 22:55:39.641154
516	12	red	bot-bot_03-745954	2026-03-14 22:55:39.644242
517	1	green	bot-bot_05-485829	2026-03-14 22:55:39.737135
518	10	yellow	bot-bot_04-182158	2026-03-14 22:55:39.742069
519	25	red	bot-bot_01-929892	2026-03-14 22:55:39.745587
520	23	green	bot-bot_03-931982	2026-03-14 22:55:39.74585
521	25	yellow	bot-bot_02-775011	2026-03-14 22:55:39.746908
522	9	yellow	bot-bot_05-974501	2026-03-14 22:55:39.837232
523	18	yellow	bot-bot_04-221893	2026-03-14 22:55:39.845036
524	1	red	bot-bot_02-239481	2026-03-14 22:55:39.846561
525	45	yellow	bot-bot_01-918688	2026-03-14 22:55:39.848581
526	7	green	bot-bot_03-997917	2026-03-14 22:55:39.849911
527	44	red	bot-bot_07-418956	2026-03-14 22:55:41.500889
528	19	green	bot-bot_09-405672	2026-03-14 22:55:41.502182
529	16	red	bot-bot_06-302390	2026-03-14 22:55:41.503867
530	11	yellow	bot-bot_08-618679	2026-03-14 22:55:41.505253
531	43	yellow	bot-bot_10-310723	2026-03-14 22:55:41.505916
532	21	red	bot-bot_07-632204	2026-03-14 22:55:41.599429
533	25	red	bot-bot_09-386543	2026-03-14 22:55:41.599649
534	18	yellow	bot-bot_06-981563	2026-03-14 22:55:41.600896
535	25	yellow	bot-bot_08-547920	2026-03-14 22:55:41.602474
536	2	green	bot-bot_10-783752	2026-03-14 22:55:41.604368
537	10	red	bot-bot_07-920431	2026-03-14 22:55:41.696211
538	2	red	bot-bot_06-292867	2026-03-14 22:55:41.697869
540	20	red	bot-bot_09-337570	2026-03-14 22:55:41.698945
541	14	yellow	bot-bot_10-418698	2026-03-14 22:55:41.700871
542	25	yellow	bot-bot_07-979625	2026-03-14 22:55:41.792934
544	17	red	bot-bot_06-578735	2026-03-14 22:55:41.794739
545	23	red	bot-bot_09-301765	2026-03-14 22:55:41.794977
546	24	yellow	bot-bot_10-375345	2026-03-14 22:55:41.797516
547	44	yellow	bot-bot_07-586083	2026-03-14 22:55:41.888919
548	24	green	bot-bot_08-757695	2026-03-14 22:55:41.889081
549	13	red	bot-bot_06-777211	2026-03-14 22:55:41.891675
550	13	yellow	bot-bot_09-753470	2026-03-14 22:55:41.891895
551	15	red	bot-bot_10-438912	2026-03-14 22:55:41.899458
552	4	red	bot-bot_15-332996	2026-03-14 22:55:43.537395
553	44	green	bot-bot_12-286140	2026-03-14 22:55:43.538663
554	23	red	bot-bot_14-124947	2026-03-14 22:55:43.538892
555	1	green	bot-bot_11-100254	2026-03-14 22:55:43.540722
556	11	red	bot-bot_13-974405	2026-03-14 22:55:43.541247
557	18	green	bot-bot_15-832004	2026-03-14 22:55:43.635082
558	1	green	bot-bot_12-111722	2026-03-14 22:55:43.636359
559	3	red	bot-bot_14-976595	2026-03-14 22:55:43.63666
560	21	yellow	bot-bot_11-644220	2026-03-14 22:55:43.63874
561	43	green	bot-bot_13-906277	2026-03-14 22:55:43.63896
562	3	yellow	bot-bot_12-694153	2026-03-14 22:55:43.734853
563	18	yellow	bot-bot_15-741533	2026-03-14 22:55:43.73496
564	24	green	bot-bot_14-837192	2026-03-14 22:55:43.735065
565	2	red	bot-bot_11-567905	2026-03-14 22:55:43.735768
566	12	red	bot-bot_13-575840	2026-03-14 22:55:43.736427
567	12	green	bot-bot_12-533351	2026-03-14 22:55:43.830259
568	7	yellow	bot-bot_11-288122	2026-03-14 22:55:43.831578
571	9	green	bot-bot_15-363700	2026-03-14 22:55:43.835889
574	9	yellow	bot-bot_14-293626	2026-03-14 22:55:43.932023
578	8	yellow	bot-bot_20-766410	2026-03-14 22:55:45.588822
586	25	green	bot-bot_17-441972	2026-03-14 22:55:45.688703
587	13	green	bot-bot_19-199721	2026-03-14 22:55:45.782896
596	20	green	bot-bot_18-542966	2026-03-14 22:55:45.885444
598	20	red	bot-bot_20-756206	2026-03-14 22:55:45.984467
605	10	green	bot-bot_25-157773	2026-03-14 22:55:47.652949
610	13	green	bot-bot_23-786984	2026-03-14 22:55:47.75283
613	10	yellow	bot-bot_21-967460	2026-03-14 22:55:47.848302
619	1	yellow	bot-bot_22-243653	2026-03-14 22:55:47.946371
625	8	red	bot-bot_23-840857	2026-03-14 22:55:48.04738
629	1	red	bot-bot_26-552461	2026-03-14 22:55:49.69558
633	8	red	bot-bot_27-623743	2026-03-14 22:55:49.792387
640	18	yellow	bot-bot_29-937310	2026-03-14 22:55:49.89243
642	16	green	bot-bot_30-927487	2026-03-14 22:55:49.983466
651	21	yellow	bot-bot_28-716312	2026-03-14 22:55:50.088363
655	4	red	bot-bot_35-294907	2026-03-14 22:55:51.739051
657	9	red	bot-bot_34-976497	2026-03-14 22:55:51.834417
666	13	yellow	bot-bot_32-327750	2026-03-14 22:55:51.936208
667	12	green	bot-bot_34-856452	2026-03-14 22:55:52.027889
676	24	red	bot-bot_35-829707	2026-03-14 22:55:52.132943
681	44	green	bot-bot_37-701677	2026-03-14 22:55:53.791966
683	4	yellow	bot-bot_40-719166	2026-03-14 22:55:53.880373
690	14	red	bot-bot_39-147624	2026-03-14 22:55:53.984874
694	11	yellow	bot-bot_38-302727	2026-03-14 22:55:54.082851
700	25	yellow	bot-bot_38-765461	2026-03-14 22:55:54.180362
702	22	red	bot-bot_41-672482	2026-03-14 22:55:55.822378
703	25	green	bot-bot_42-266590	2026-03-14 22:55:55.825447
710	24	green	bot-bot_44-110427	2026-03-14 22:55:55.925278
712	42	green	bot-bot_41-161377	2026-03-14 22:55:56.017279
721	14	red	bot-bot_43-604136	2026-03-14 22:55:56.122181
722	7	green	bot-bot_41-764493	2026-03-14 22:55:56.210062
729	7	yellow	bot-bot_49-596433	2026-03-14 22:55:57.924409
734	21	yellow	bot-bot_49-606514	2026-03-14 22:55:58.02276
738	7	green	bot-bot_47-599391	2026-03-14 22:55:58.119831
741	22	red	bot-bot_50-828521	2026-03-14 22:55:58.124164
743	10	green	bot-bot_49-857774	2026-03-14 22:55:58.218174
751	5	red	bot-bot_50-887035	2026-03-14 22:55:58.319858
1010	709	red	bot-bot_01-143768	2026-03-14 22:59:21.650265
1027	20	red	bot-bot_06-669795	2026-03-14 22:59:23.627829
1045	695	red	bot-bot_10-114980	2026-03-14 22:59:23.940043
1062	752	green	bot-bot_12-340158	2026-03-14 22:59:25.927945
1080	650	red	bot-bot_19-778519	2026-03-14 22:59:27.857893
1098	657	red	bot-bot_19-163936	2026-03-14 22:59:28.251741
1116	702	red	bot-bot_21-120964	2026-03-14 22:59:30.142932
1133	648	green	bot-bot_26-259675	2026-03-14 22:59:32.100617
1151	723	yellow	bot-bot_29-716906	2026-03-14 22:59:32.412867
1170	661	yellow	bot-bot_32-199934	2026-03-14 22:59:34.358671
1187	742	yellow	bot-bot_40-638231	2026-03-14 22:59:36.329209
1204	22	yellow	bot-bot_42-290397	2026-03-14 22:59:38.232154
1209	701	red	bot-bot_42-576610	2026-03-14 22:59:38.328857
1215	762	yellow	bot-bot_42-546685	2026-03-14 22:59:38.429779
1216	750	green	bot-bot_45-903863	2026-03-14 22:59:38.435313
1217	693	yellow	bot-bot_41-849091	2026-03-14 22:59:38.5248
1226	663	green	bot-bot_45-579485	2026-03-14 22:59:38.630136
1228	722	green	bot-bot_49-446466	2026-03-14 22:59:40.45812
1232	697	yellow	bot-bot_46-283604	2026-03-14 22:59:40.555917
1241	650	green	bot-bot_50-895881	2026-03-14 22:59:40.660461
1243	677	yellow	bot-bot_49-849543	2026-03-14 22:59:40.753749
1246	689	yellow	bot-bot_50-757534	2026-03-14 22:59:40.80573
1247	727	yellow	bot-bot_46-682035	2026-03-14 22:59:40.850122
1759	650	red	bot-bot_02-692884	2026-03-14 23:10:55.610027
1764	736	green	bot-bot_01-948541	2026-03-14 23:10:55.709369
1766	657	yellow	bot-bot_02-435932	2026-03-14 23:10:55.715955
1767	764	green	bot-bot_05-183490	2026-03-14 23:10:55.79814
1771	677	green	bot-bot_02-567922	2026-03-14 23:10:55.813614
1772	759	green	bot-bot_05-757207	2026-03-14 23:10:55.89513
1774	664	red	bot-bot_01-690602	2026-03-14 23:10:55.91154
1779	680	yellow	bot-bot_09-448441	2026-03-14 23:10:57.575091
1785	23	red	bot-bot_07-764791	2026-03-14 23:10:57.673867
1792	675	green	bot-bot_08-741733	2026-03-14 23:10:57.871937
1796	735	red	bot-bot_07-820383	2026-03-14 23:10:57.875666
1821	10	green	bot-bot_15-507930	2026-03-14 23:11:00.211835
1827	4	red	bot-bot_19-170940	2026-03-14 23:11:02.019272
1836	756	yellow	bot-bot_16-118866	2026-03-14 23:11:02.121679
1849	675	yellow	bot-bot_17-922878	2026-03-14 23:11:02.414407
1862	696	red	bot-bot_25-924133	2026-03-14 23:11:04.267948
1887	2	yellow	bot-bot_26-704152	2026-03-14 23:11:06.34198
1896	763	green	bot-bot_30-358303	2026-03-14 23:11:06.454283
1901	662	green	bot-bot_30-877707	2026-03-14 23:11:06.573428
1916	3	yellow	bot-bot_33-376974	2026-03-14 23:11:08.518172
1925	665	green	bot-bot_34-616571	2026-03-14 23:11:08.713715
1929	719	yellow	bot-bot_39-748161	2026-03-14 23:11:10.399251
1940	736	red	bot-bot_39-686309	2026-03-14 23:11:10.614543
1977	649	red	bot-bot_48-204354	2026-03-14 23:11:14.570347
1986	750	green	bot-bot_46-787993	2026-03-14 23:11:14.672598
1987	696	red	bot-bot_48-949767	2026-03-14 23:11:14.769584
569	8	red	bot-bot_14-310597	2026-03-14 22:55:43.835617
573	6	red	bot-bot_11-978183	2026-03-14 22:55:43.928845
580	14	red	bot-bot_18-167361	2026-03-14 22:55:45.591458
584	43	red	bot-bot_19-382761	2026-03-14 22:55:45.686412
588	2	red	bot-bot_20-629635	2026-03-14 22:55:45.783307
597	4	green	bot-bot_19-187683	2026-03-14 22:55:45.984103
604	14	red	bot-bot_23-597696	2026-03-14 22:55:47.652738
609	24	green	bot-bot_21-404389	2026-03-14 22:55:47.751103
614	8	red	bot-bot_22-177443	2026-03-14 22:55:47.849551
620	18	yellow	bot-bot_23-813864	2026-03-14 22:55:47.948959
622	45	yellow	bot-bot_24-205546	2026-03-14 22:55:48.042908
636	11	red	bot-bot_28-466782	2026-03-14 22:55:49.794405
639	7	red	bot-bot_26-635852	2026-03-14 22:55:49.88908
644	12	red	bot-bot_26-298730	2026-03-14 22:55:49.98611
649	45	red	bot-bot_26-613750	2026-03-14 22:55:50.082792
653	15	green	bot-bot_31-223556	2026-03-14 22:55:51.736388
660	22	green	bot-bot_35-907087	2026-03-14 22:55:51.836132
662	25	yellow	bot-bot_34-568505	2026-03-14 22:55:51.931257
671	9	green	bot-bot_35-436343	2026-03-14 22:55:52.035551
672	13	yellow	bot-bot_34-612183	2026-03-14 22:55:52.12451
679	15	yellow	bot-bot_39-613970	2026-03-14 22:55:53.787468
684	5	red	bot-bot_39-186700	2026-03-14 22:55:53.886226
688	45	green	bot-bot_40-186880	2026-03-14 22:55:53.977268
695	19	green	bot-bot_39-813593	2026-03-14 22:55:54.083229
701	24	green	bot-bot_37-346862	2026-03-14 22:55:54.180541
704	12	red	bot-bot_44-450920	2026-03-14 22:55:55.825705
707	22	red	bot-bot_41-970487	2026-03-14 22:55:55.91998
716	7	yellow	bot-bot_45-511223	2026-03-14 22:55:56.023635
717	20	yellow	bot-bot_41-728291	2026-03-14 22:55:56.112959
718	6	yellow	bot-bot_42-536893	2026-03-14 22:55:56.116227
725	42	green	bot-bot_43-876324	2026-03-14 22:55:56.217149
730	8	green	bot-bot_50-381947	2026-03-14 22:55:57.924634
739	3	yellow	bot-bot_49-793390	2026-03-14 22:55:58.121462
745	11	green	bot-bot_48-327007	2026-03-14 22:55:58.221079
1011	731	yellow	bot-bot_04-424002	2026-03-14 22:59:21.651123
1028	652	green	bot-bot_08-312676	2026-03-14 22:59:23.639162
1046	753	yellow	bot-bot_07-796323	2026-03-14 22:59:23.954435
1063	1	green	bot-bot_11-920852	2026-03-14 22:59:25.929269
1099	744	green	bot-bot_20-431945	2026-03-14 22:59:28.25501
1117	663	yellow	bot-bot_22-233972	2026-03-14 22:59:30.231163
1134	14	green	bot-bot_30-885801	2026-03-14 22:59:32.110367
1188	721	red	bot-bot_38-118105	2026-03-14 22:59:36.355143
1205	665	yellow	bot-bot_43-639090	2026-03-14 22:59:38.23472
1207	706	green	bot-bot_41-222205	2026-03-14 22:59:38.327661
1225	702	yellow	bot-bot_43-141501	2026-03-14 22:59:38.629748
1230	732	red	bot-bot_47-942317	2026-03-14 22:59:40.459578
1240	649	green	bot-bot_47-808038	2026-03-14 22:59:40.660034
1242	3	red	bot-bot_46-356549	2026-03-14 22:59:40.751352
1249	654	green	bot-bot_48-597466	2026-03-14 22:59:40.852296
1753	760	red	bot-bot_03-577284	2026-03-14 23:10:55.501984
1783	672	yellow	bot-bot_06-576460	2026-03-14 23:10:57.671902
1788	745	green	bot-bot_06-200314	2026-03-14 23:10:57.773833
1795	689	green	bot-bot_10-956530	2026-03-14 23:10:57.875321
1811	757	yellow	bot-bot_12-787326	2026-03-14 23:11:00.013924
1812	736	green	bot-bot_13-661691	2026-03-14 23:11:00.10803
1824	763	green	bot-bot_11-547645	2026-03-14 23:11:00.310573
1830	721	red	bot-bot_20-224484	2026-03-14 23:11:02.020857
1833	1	red	bot-bot_20-779590	2026-03-14 23:11:02.118663
1844	724	yellow	bot-bot_16-636120	2026-03-14 23:11:02.316655
1866	15	green	bot-bot_24-873200	2026-03-14 23:11:04.278169
1903	659	yellow	bot-bot_32-485537	2026-03-14 23:11:08.317278
1912	660	red	bot-bot_31-408078	2026-03-14 23:11:08.511264
1921	752	yellow	bot-bot_33-637684	2026-03-14 23:11:08.619059
1946	660	green	bot-bot_40-313141	2026-03-14 23:11:10.713289
1953	689	red	bot-bot_43-296117	2026-03-14 23:11:12.491296
1976	24	yellow	bot-bot_42-613955	2026-03-14 23:11:12.911123
1980	13	red	bot-bot_50-765023	2026-03-14 23:11:14.573339
1984	683	red	bot-bot_50-612986	2026-03-14 23:11:14.670781
1997	675	green	bot-bot_48-343769	2026-03-14 23:11:14.964626
2001	42	red	bot-bot_49-361714	2026-03-14 23:11:14.968713
570	17	red	bot-bot_13-363119	2026-03-14 22:55:43.835825
572	16	yellow	bot-bot_12-764996	2026-03-14 22:55:43.927616
581	15	green	bot-bot_19-335752	2026-03-14 22:55:45.59161
583	17	red	bot-bot_16-377606	2026-03-14 22:55:45.68498
591	12	green	bot-bot_17-612233	2026-03-14 22:55:45.785884
592	10	yellow	bot-bot_19-833324	2026-03-14 22:55:45.881422
601	12	green	bot-bot_18-271652	2026-03-14 22:55:45.985365
606	9	green	bot-bot_22-637115	2026-03-14 22:55:47.653833
607	44	yellow	bot-bot_24-818228	2026-03-14 22:55:47.749503
611	6	yellow	bot-bot_25-601239	2026-03-14 22:55:47.753056
612	2	yellow	bot-bot_24-659280	2026-03-14 22:55:47.848193
615	43	yellow	bot-bot_25-576522	2026-03-14 22:55:47.851257
618	25	yellow	bot-bot_21-646018	2026-03-14 22:55:47.946235
624	15	green	bot-bot_22-577152	2026-03-14 22:55:48.044308
627	20	green	bot-bot_30-752530	2026-03-14 22:55:49.692621
630	19	yellow	bot-bot_29-388671	2026-03-14 22:55:49.696441
634	23	red	bot-bot_26-474438	2026-03-14 22:55:49.792958
637	15	yellow	bot-bot_30-606651	2026-03-14 22:55:49.886267
646	20	red	bot-bot_28-467503	2026-03-14 22:55:49.990969
647	3	yellow	bot-bot_30-259648	2026-03-14 22:55:50.081354
654	21	red	bot-bot_33-256307	2026-03-14 22:55:51.736528
659	3	red	bot-bot_31-905182	2026-03-14 22:55:51.836003
665	16	yellow	bot-bot_35-316643	2026-03-14 22:55:51.93603
668	19	red	bot-bot_33-120596	2026-03-14 22:55:52.029101
675	17	yellow	bot-bot_31-417880	2026-03-14 22:55:52.130658
680	18	green	bot-bot_38-489585	2026-03-14 22:55:53.791577
682	17	red	bot-bot_36-291380	2026-03-14 22:55:53.880259
691	1	yellow	bot-bot_37-510476	2026-03-14 22:55:53.986418
692	25	red	bot-bot_36-525490	2026-03-14 22:55:54.072527
698	26	green	bot-bot_40-182968	2026-03-14 22:55:54.169472
711	42	green	bot-bot_45-391452	2026-03-14 22:55:55.925394
714	19	green	bot-bot_44-277499	2026-03-14 22:55:56.02181
719	22	green	bot-bot_44-962764	2026-03-14 22:55:56.118391
724	14	yellow	bot-bot_44-846819	2026-03-14 22:55:56.212823
728	22	green	bot-bot_47-465210	2026-03-14 22:55:57.923123
733	42	green	bot-bot_47-157162	2026-03-14 22:55:58.02032
740	15	yellow	bot-bot_48-459844	2026-03-14 22:55:58.123965
742	12	green	bot-bot_46-399928	2026-03-14 22:55:58.21807
750	13	yellow	bot-bot_48-767248	2026-03-14 22:55:58.319598
1012	14	green	bot-bot_03-881807	2026-03-14 22:59:21.750934
1029	739	yellow	bot-bot_09-219434	2026-03-14 22:59:23.647733
1047	748	yellow	bot-bot_06-426710	2026-03-14 22:59:24.021373
1065	650	green	bot-bot_15-498272	2026-03-14 22:59:25.937868
1082	747	yellow	bot-bot_20-767429	2026-03-14 22:59:27.943766
1084	647	red	bot-bot_19-416975	2026-03-14 22:59:27.950093
1100	9	yellow	bot-bot_18-768369	2026-03-14 22:59:28.27558
1118	693	red	bot-bot_23-816264	2026-03-14 22:59:30.231929
1135	8	green	bot-bot_28-806292	2026-03-14 22:59:32.114835
1153	726	red	bot-bot_31-453850	2026-03-14 22:59:34.055516
1154	1	yellow	bot-bot_34-671921	2026-03-14 22:59:34.061474
1172	750	yellow	bot-bot_34-822981	2026-03-14 22:59:34.451847
1189	17	red	bot-bot_39-769808	2026-03-14 22:59:36.355874
1206	670	red	bot-bot_45-121185	2026-03-14 22:59:38.23483
1208	672	green	bot-bot_44-812236	2026-03-14 22:59:38.327866
1219	715	green	bot-bot_42-566823	2026-03-14 22:59:38.529721
1223	724	red	bot-bot_44-541302	2026-03-14 22:59:38.624867
1231	673	green	bot-bot_48-392397	2026-03-14 22:59:40.460001
1234	674	green	bot-bot_47-663731	2026-03-14 22:59:40.560861
1761	687	red	bot-bot_04-836609	2026-03-14 23:10:55.613089
1763	649	red	bot-bot_03-552146	2026-03-14 23:10:55.700268
1786	737	green	bot-bot_10-568960	2026-03-14 23:10:57.676755
1787	741	yellow	bot-bot_08-568609	2026-03-14 23:10:57.772453
1789	12	red	bot-bot_09-728474	2026-03-14 23:10:57.775555
1803	727	green	bot-bot_11-462169	2026-03-14 23:10:59.912446
1818	680	green	bot-bot_11-101268	2026-03-14 23:11:00.208476
1825	751	red	bot-bot_12-931956	2026-03-14 23:11:00.313315
1831	26	yellow	bot-bot_17-978466	2026-03-14 23:11:02.022475
1834	729	red	bot-bot_18-520103	2026-03-14 23:11:02.118963
1837	655	yellow	bot-bot_18-701743	2026-03-14 23:11:02.216767
1847	763	green	bot-bot_18-511468	2026-03-14 23:11:02.412768
1861	738	red	bot-bot_23-173530	2026-03-14 23:11:04.178398
1864	759	yellow	bot-bot_23-205305	2026-03-14 23:11:04.275245
1874	675	yellow	bot-bot_23-282367	2026-03-14 23:11:04.469875
1881	759	red	bot-bot_30-666020	2026-03-14 23:11:06.144874
1882	22	green	bot-bot_26-623637	2026-03-14 23:11:06.229729
1888	647	yellow	bot-bot_28-117513	2026-03-14 23:11:06.342155
1897	728	yellow	bot-bot_26-612033	2026-03-14 23:11:06.551721
1902	720	yellow	bot-bot_31-822588	2026-03-14 23:11:08.315044
1911	10	red	bot-bot_34-113853	2026-03-14 23:11:08.421079
1932	693	green	bot-bot_36-854411	2026-03-14 23:11:10.495826
1973	719	yellow	bot-bot_44-986979	2026-03-14 23:11:12.905889
1982	692	red	bot-bot_48-544870	2026-03-14 23:11:14.669332
575	13	yellow	bot-bot_15-728539	2026-03-14 22:55:43.934942
577	44	red	bot-bot_16-543029	2026-03-14 22:55:45.588464
585	9	yellow	bot-bot_18-379827	2026-03-14 22:55:45.686676
589	19	green	bot-bot_18-451411	2026-03-14 22:55:45.7835
594	6	red	bot-bot_16-396218	2026-03-14 22:55:45.883976
600	2	green	bot-bot_17-209627	2026-03-14 22:55:45.985072
602	2	red	bot-bot_24-588097	2026-03-14 22:55:47.651999
631	21	yellow	bot-bot_28-268444	2026-03-14 22:55:49.697163
632	11	green	bot-bot_30-864395	2026-03-14 22:55:49.789696
635	13	green	bot-bot_29-149311	2026-03-14 22:55:49.793188
638	5	yellow	bot-bot_27-971904	2026-03-14 22:55:49.887567
645	45	red	bot-bot_29-947547	2026-03-14 22:55:49.989188
648	10	red	bot-bot_27-244712	2026-03-14 22:55:50.08251
650	8	green	bot-bot_29-347314	2026-03-14 22:55:50.087539
656	2	red	bot-bot_32-637635	2026-03-14 22:55:51.739197
658	2	red	bot-bot_33-675358	2026-03-14 22:55:51.834529
664	20	yellow	bot-bot_31-926768	2026-03-14 22:55:51.935865
669	11	yellow	bot-bot_31-486308	2026-03-14 22:55:52.033877
674	42	yellow	bot-bot_32-987909	2026-03-14 22:55:52.130505
677	7	red	bot-bot_36-246631	2026-03-14 22:55:53.783438
686	6	red	bot-bot_37-566827	2026-03-14 22:55:53.890152
687	19	red	bot-bot_36-656100	2026-03-14 22:55:53.976093
696	5	yellow	bot-bot_37-518914	2026-03-14 22:55:54.083423
699	6	yellow	bot-bot_39-108698	2026-03-14 22:55:54.178698
706	22	red	bot-bot_43-760696	2026-03-14 22:55:55.827577
709	12	red	bot-bot_43-267487	2026-03-14 22:55:55.924985
713	21	yellow	bot-bot_42-390710	2026-03-14 22:55:56.017386
720	16	yellow	bot-bot_45-130291	2026-03-14 22:55:56.120345
723	18	red	bot-bot_42-535267	2026-03-14 22:55:56.211286
727	16	green	bot-bot_46-749834	2026-03-14 22:55:57.922964
731	26	green	bot-bot_48-727755	2026-03-14 22:55:57.926491
732	42	green	bot-bot_46-470752	2026-03-14 22:55:58.01998
744	1	yellow	bot-bot_47-277837	2026-03-14 22:55:58.219469
746	24	red	bot-bot_50-639315	2026-03-14 22:55:58.224104
747	25	red	bot-bot_47-369578	2026-03-14 22:55:58.31849
1013	729	green	bot-bot_02-289759	2026-03-14 22:59:21.751829
1048	675	red	bot-bot_08-832491	2026-03-14 22:59:24.021819
1083	674	red	bot-bot_16-276113	2026-03-14 22:59:27.948405
1119	5	red	bot-bot_25-628496	2026-03-14 22:59:30.23394
1136	747	yellow	bot-bot_29-366451	2026-03-14 22:59:32.125938
1155	756	red	bot-bot_32-973976	2026-03-14 22:59:34.061577
1173	7	green	bot-bot_31-486709	2026-03-14 22:59:34.452624
1190	740	red	bot-bot_37-781599	2026-03-14 22:59:36.37154
1252	656	yellow	bot-bot_05-218831	2026-03-14 23:07:47.797903
1261	746	red	bot-bot_04-384398	2026-03-14 23:07:47.909128
1275	725	red	bot-bot_03-780725	2026-03-14 23:07:48.212907
1280	661	yellow	bot-bot_10-527029	2026-03-14 23:07:49.913732
1284	713	yellow	bot-bot_09-873546	2026-03-14 23:07:50.011607
1291	692	green	bot-bot_06-200682	2026-03-14 23:07:50.115814
1292	763	red	bot-bot_07-642319	2026-03-14 23:07:50.202044
1301	737	yellow	bot-bot_06-378251	2026-03-14 23:07:50.310454
1322	737	red	bot-bot_14-231684	2026-03-14 23:07:52.387287
1328	695	red	bot-bot_17-774440	2026-03-14 23:07:54.05964
1334	10	red	bot-bot_18-323033	2026-03-14 23:07:54.162352
1337	711	yellow	bot-bot_19-362442	2026-03-14 23:07:54.257464
1353	697	green	bot-bot_25-222956	2026-03-14 23:07:56.341505
1363	22	red	bot-bot_22-162428	2026-03-14 23:07:56.541191
1376	727	green	bot-bot_24-443088	2026-03-14 23:07:56.742536
1386	719	yellow	bot-bot_29-252494	2026-03-14 23:07:58.50826
1389	677	red	bot-bot_26-413692	2026-03-14 23:07:58.608297
1399	689	green	bot-bot_29-938222	2026-03-14 23:07:58.800901
1411	707	green	bot-bot_33-794421	2026-03-14 23:08:00.586601
1412	20	red	bot-bot_31-257234	2026-03-14 23:08:00.67886
1438	10	green	bot-bot_40-647247	2026-03-14 23:08:02.732587
1466	666	yellow	bot-bot_45-548146	2026-03-14 23:08:04.834238
1474	676	red	bot-bot_44-262257	2026-03-14 23:08:05.050757
1477	736	yellow	bot-bot_50-181143	2026-03-14 23:08:06.716148
1492	663	yellow	bot-bot_46-317000	2026-03-14 23:08:07.021758
1755	702	red	bot-bot_04-399438	2026-03-14 23:10:55.510177
1773	711	yellow	bot-bot_03-386010	2026-03-14 23:10:55.8953
1775	700	yellow	bot-bot_04-833685	2026-03-14 23:10:55.914536
1781	719	yellow	bot-bot_10-828178	2026-03-14 23:10:57.578174
1782	683	green	bot-bot_08-475702	2026-03-14 23:10:57.671745
1791	678	red	bot-bot_07-374419	2026-03-14 23:10:57.777311
1805	2	red	bot-bot_12-413462	2026-03-14 23:10:59.913333
1815	665	red	bot-bot_12-447861	2026-03-14 23:11:00.113283
1817	711	red	bot-bot_13-790006	2026-03-14 23:11:00.206961
1835	710	green	bot-bot_17-805732	2026-03-14 23:11:02.121477
1838	667	green	bot-bot_19-416467	2026-03-14 23:11:02.218277
1853	12	red	bot-bot_22-790777	2026-03-14 23:11:04.075235
1860	24	red	bot-bot_24-733829	2026-03-14 23:11:04.177028
1863	652	green	bot-bot_22-923011	2026-03-14 23:11:04.268163
1875	763	red	bot-bot_21-693710	2026-03-14 23:11:04.472405
1877	741	red	bot-bot_26-661296	2026-03-14 23:11:06.13313
1900	742	green	bot-bot_29-972670	2026-03-14 23:11:06.57047
1904	733	red	bot-bot_33-156819	2026-03-14 23:11:08.319829
1909	6	yellow	bot-bot_33-717970	2026-03-14 23:11:08.418384
1924	11	green	bot-bot_35-142767	2026-03-14 23:11:08.712025
1927	671	yellow	bot-bot_36-460491	2026-03-14 23:11:10.398008
1936	684	yellow	bot-bot_40-133966	2026-03-14 23:11:10.503309
1938	679	red	bot-bot_37-799616	2026-03-14 23:11:10.601954
1945	758	red	bot-bot_39-103685	2026-03-14 23:11:10.713106
1947	15	green	bot-bot_36-384425	2026-03-14 23:11:10.798938
1951	700	red	bot-bot_40-147441	2026-03-14 23:11:10.827632
576	15	green	bot-bot_13-489334	2026-03-14 22:55:43.935233
579	6	red	bot-bot_17-888911	2026-03-14 22:55:45.591147
582	43	yellow	bot-bot_20-393928	2026-03-14 22:55:45.684879
590	16	yellow	bot-bot_16-906911	2026-03-14 22:55:45.783729
593	14	red	bot-bot_20-991896	2026-03-14 22:55:45.883006
599	43	yellow	bot-bot_16-245741	2026-03-14 22:55:45.984915
603	2	red	bot-bot_21-169204	2026-03-14 22:55:47.65215
608	19	red	bot-bot_22-966298	2026-03-14 22:55:47.750739
616	8	green	bot-bot_23-572271	2026-03-14 22:55:47.851587
617	7	yellow	bot-bot_24-387710	2026-03-14 22:55:47.94612
621	13	yellow	bot-bot_25-160755	2026-03-14 22:55:47.949298
623	8	yellow	bot-bot_21-189509	2026-03-14 22:55:48.044009
626	1	yellow	bot-bot_25-696004	2026-03-14 22:55:48.049318
628	4	yellow	bot-bot_27-958522	2026-03-14 22:55:49.695092
641	26	yellow	bot-bot_28-597827	2026-03-14 22:55:49.892608
643	7	green	bot-bot_27-190831	2026-03-14 22:55:49.984592
652	17	green	bot-bot_34-459522	2026-03-14 22:55:51.736318
661	45	yellow	bot-bot_32-200493	2026-03-14 22:55:51.836299
663	17	yellow	bot-bot_33-394650	2026-03-14 22:55:51.932397
670	2	red	bot-bot_32-320656	2026-03-14 22:55:52.034018
673	11	red	bot-bot_33-178289	2026-03-14 22:55:52.124661
678	23	yellow	bot-bot_40-523051	2026-03-14 22:55:53.783558
685	5	yellow	bot-bot_38-704927	2026-03-14 22:55:53.888619
689	4	yellow	bot-bot_38-267742	2026-03-14 22:55:53.984677
693	2	yellow	bot-bot_40-482991	2026-03-14 22:55:54.073921
697	7	red	bot-bot_36-722355	2026-03-14 22:55:54.169307
705	7	green	bot-bot_45-780172	2026-03-14 22:55:55.827404
708	2	red	bot-bot_42-229991	2026-03-14 22:55:55.922226
715	25	yellow	bot-bot_43-283254	2026-03-14 22:55:56.02348
726	7	red	bot-bot_45-236500	2026-03-14 22:55:56.219861
736	1	red	bot-bot_50-844424	2026-03-14 22:55:58.023355
737	18	green	bot-bot_46-868498	2026-03-14 22:55:58.118363
749	11	green	bot-bot_49-544346	2026-03-14 22:55:58.319399
1014	737	red	bot-bot_04-542843	2026-03-14 22:59:21.752878
1031	711	yellow	bot-bot_07-702461	2026-03-14 22:59:23.664077
1049	672	red	bot-bot_09-851706	2026-03-14 22:59:24.03783
757	26	yellow	bot-bot_03-878682	2026-03-14 22:58:29.998166
1085	662	yellow	bot-bot_17-326365	2026-03-14 22:59:27.957492
759	4	green	bot-bot_05-335242	2026-03-14 22:58:30.000384
1102	762	red	bot-bot_22-373120	2026-03-14 22:59:29.933033
1120	23	green	bot-bot_24-398454	2026-03-14 22:59:30.239813
762	20	green	bot-bot_03-551191	2026-03-14 22:58:30.096571
1156	663	red	bot-bot_33-911500	2026-03-14 22:59:34.073796
1191	19	green	bot-bot_36-892850	2026-03-14 22:59:36.373558
767	5	green	bot-bot_03-101700	2026-03-14 22:58:30.194258
769	45	red	bot-bot_04-245685	2026-03-14 22:58:30.203278
1258	703	green	bot-bot_03-241093	2026-03-14 23:07:47.905624
1281	646	green	bot-bot_06-488864	2026-03-14 23:07:49.914723
1282	44	yellow	bot-bot_07-562530	2026-03-14 23:07:50.003715
1287	8	green	bot-bot_07-700255	2026-03-14 23:07:50.102642
778	17	green	bot-bot_08-783775	2026-03-14 22:58:31.955948
779	43	yellow	bot-bot_10-175344	2026-03-14 22:58:31.956199
780	6	red	bot-bot_09-831294	2026-03-14 22:58:31.960935
1296	678	green	bot-bot_06-929662	2026-03-14 23:07:50.213304
1298	714	red	bot-bot_08-200109	2026-03-14 23:07:50.307865
1306	694	red	bot-bot_15-497914	2026-03-14 23:07:51.982551
1313	744	red	bot-bot_11-590265	2026-03-14 23:07:52.18628
789	42	green	bot-bot_09-585669	2026-03-14 22:58:32.301589
1323	699	green	bot-bot_11-706308	2026-03-14 23:07:52.387431
791	42	yellow	bot-bot_07-649109	2026-03-14 22:58:32.303667
792	14	green	bot-bot_06-706712	2026-03-14 22:58:32.392888
1329	690	yellow	bot-bot_18-848826	2026-03-14 23:07:54.061546
1349	692	yellow	bot-bot_18-843504	2026-03-14 23:07:54.457834
796	44	yellow	bot-bot_10-157421	2026-03-14 22:58:32.401496
1350	698	green	bot-bot_20-172649	2026-03-14 23:07:54.463031
798	44	green	bot-bot_08-991761	2026-03-14 22:58:32.493028
1362	762	yellow	bot-bot_21-120070	2026-03-14 23:07:56.538748
1381	709	yellow	bot-bot_29-764489	2026-03-14 23:07:58.411439
804	23	yellow	bot-bot_15-646526	2026-03-14 22:58:34.165809
1382	670	red	bot-bot_30-358408	2026-03-14 23:07:58.502858
1391	724	green	bot-bot_29-222816	2026-03-14 23:07:58.608646
1405	6	green	bot-bot_35-942275	2026-03-14 23:08:00.485902
1408	14	green	bot-bot_34-303813	2026-03-14 23:08:00.581578
1415	700	yellow	bot-bot_34-471714	2026-03-14 23:08:00.68399
1418	17	green	bot-bot_35-508700	2026-03-14 23:08:00.779098
813	4	red	bot-bot_13-918500	2026-03-14 22:58:34.356862
1421	694	yellow	bot-bot_34-820305	2026-03-14 23:08:00.784317
1429	764	red	bot-bot_39-792762	2026-03-14 23:08:02.536804
1458	715	green	bot-bot_43-506502	2026-03-14 23:08:04.698372
1473	755	red	bot-bot_42-677310	2026-03-14 23:08:05.035335
827	4	yellow	bot-bot_16-207522	2026-03-14 22:58:36.223255
830	43	yellow	bot-bot_20-383194	2026-03-14 22:58:36.22633
1498	752	yellow	bot-bot_46-111400	2026-03-14 23:08:07.121014
1756	697	green	bot-bot_02-904215	2026-03-14 23:10:55.510335
1762	711	yellow	bot-bot_05-608522	2026-03-14 23:10:55.700013
1765	24	green	bot-bot_04-775931	2026-03-14 23:10:55.715576
1777	6	yellow	bot-bot_08-761423	2026-03-14 23:10:57.573383
1804	763	green	bot-bot_15-608716	2026-03-14 23:10:59.912899
1807	728	red	bot-bot_13-273747	2026-03-14 23:11:00.007979
1809	756	yellow	bot-bot_14-630925	2026-03-14 23:11:00.01193
1832	660	yellow	bot-bot_19-850781	2026-03-14 23:11:02.118564
1840	12	red	bot-bot_16-507574	2026-03-14 23:11:02.219138
1854	697	yellow	bot-bot_21-117186	2026-03-14 23:11:04.078206
1865	759	yellow	bot-bot_21-931671	2026-03-14 23:11:04.277647
1880	651	green	bot-bot_27-186376	2026-03-14 23:11:06.142087
1883	744	red	bot-bot_28-217032	2026-03-14 23:11:06.230901
1015	687	green	bot-bot_01-862636	2026-03-14 22:59:21.754493
1032	742	yellow	bot-bot_06-964787	2026-03-14 22:59:23.723835
1050	732	green	bot-bot_10-246893	2026-03-14 22:59:24.038992
850	18	red	bot-bot_20-654731	2026-03-14 22:58:36.823336
1068	695	red	bot-bot_14-760870	2026-03-14 22:59:26.031243
878	24	yellow	bot-bot_28-701612	2026-03-14 22:58:40.579186
1103	763	red	bot-bot_23-727889	2026-03-14 22:59:29.934229
1106	4	red	bot-bot_25-292473	2026-03-14 22:59:29.942256
1138	693	red	bot-bot_26-681553	2026-03-14 22:59:32.197578
1157	11	green	bot-bot_35-175848	2026-03-14 22:59:34.152397
1175	672	green	bot-bot_32-535609	2026-03-14 22:59:34.458129
1192	658	red	bot-bot_40-578688	2026-03-14 22:59:36.425221
1264	705	yellow	bot-bot_04-653764	2026-03-14 23:07:48.011034
1278	761	green	bot-bot_08-789463	2026-03-14 23:07:49.910509
1285	648	yellow	bot-bot_10-481016	2026-03-14 23:07:50.01215
1289	650	red	bot-bot_09-711867	2026-03-14 23:07:50.111197
1305	680	yellow	bot-bot_11-101032	2026-03-14 23:07:51.98229
1315	43	yellow	bot-bot_12-275553	2026-03-14 23:07:52.190178
1317	650	yellow	bot-bot_14-847461	2026-03-14 23:07:52.285638
1326	22	green	bot-bot_15-951150	2026-03-14 23:07:52.389698
1327	699	green	bot-bot_19-474854	2026-03-14 23:07:54.057961
1339	676	green	bot-bot_18-939672	2026-03-14 23:07:54.259276
1356	10	yellow	bot-bot_23-690702	2026-03-14 23:07:56.347463
1358	752	yellow	bot-bot_25-226197	2026-03-14 23:07:56.440056
1374	657	yellow	bot-bot_23-507448	2026-03-14 23:07:56.740969
1384	676	red	bot-bot_27-426942	2026-03-14 23:07:58.507475
1388	655	green	bot-bot_28-389160	2026-03-14 23:07:58.602993
1398	760	yellow	bot-bot_28-669083	2026-03-14 23:07:58.79533
1410	734	yellow	bot-bot_32-817142	2026-03-14 23:08:00.583383
1424	749	red	bot-bot_33-700374	2026-03-14 23:08:00.879509
1435	743	yellow	bot-bot_40-268378	2026-03-14 23:08:02.63488
1440	672	red	bot-bot_38-840867	2026-03-14 23:08:02.734081
1448	653	green	bot-bot_40-886341	2026-03-14 23:08:02.925332
1449	761	red	bot-bot_39-887802	2026-03-14 23:08:02.931995
1460	756	yellow	bot-bot_44-790777	2026-03-14 23:08:04.703355
1461	713	green	bot-bot_45-270549	2026-03-14 23:08:04.715367
1469	685	red	bot-bot_44-466700	2026-03-14 23:08:04.94666
1481	9	green	bot-bot_47-562119	2026-03-14 23:08:06.721587
1899	756	red	bot-bot_27-271544	2026-03-14 23:11:06.569005
1905	9	yellow	bot-bot_35-613499	2026-03-14 23:11:08.321469
1907	759	green	bot-bot_31-319626	2026-03-14 23:11:08.412168
1908	689	red	bot-bot_32-246976	2026-03-14 23:11:08.415225
1922	26	yellow	bot-bot_31-673440	2026-03-14 23:11:08.706093
1928	2	red	bot-bot_37-375858	2026-03-14 23:11:10.398166
1941	682	yellow	bot-bot_40-518183	2026-03-14 23:11:10.614943
1942	3	red	bot-bot_36-732905	2026-03-14 23:11:10.699981
1965	741	yellow	bot-bot_41-247043	2026-03-14 23:11:12.688606
1967	698	green	bot-bot_45-355605	2026-03-14 23:11:12.805991
1971	663	red	bot-bot_42-586642	2026-03-14 23:11:12.814464
1972	762	green	bot-bot_45-321618	2026-03-14 23:11:12.905003
1978	692	yellow	bot-bot_47-483287	2026-03-14 23:11:14.571676
1990	743	yellow	bot-bot_46-904544	2026-03-14 23:11:14.771345
1992	3	yellow	bot-bot_48-149594	2026-03-14 23:11:14.866542
1996	703	red	bot-bot_50-632476	2026-03-14 23:11:14.869891
834	15	green	bot-bot_18-154610	2026-03-14 22:58:36.32325
1016	754	green	bot-bot_05-923816	2026-03-14 22:59:21.757824
1033	758	red	bot-bot_08-859545	2026-03-14 22:59:23.735103
1051	42	red	bot-bot_07-974762	2026-03-14 22:59:24.052057
887	4	green	bot-bot_26-139197	2026-03-14 22:58:40.769915
1069	735	yellow	bot-bot_15-679582	2026-03-14 22:59:26.0341
1087	689	yellow	bot-bot_16-966395	2026-03-14 22:59:28.048495
1104	702	green	bot-bot_21-794636	2026-03-14 22:59:29.935549
1139	711	red	bot-bot_30-936980	2026-03-14 22:59:32.207623
1158	759	red	bot-bot_34-807389	2026-03-14 22:59:34.158806
1176	694	yellow	bot-bot_33-247835	2026-03-14 22:59:34.467579
1193	718	yellow	bot-bot_38-845554	2026-03-14 22:59:36.450929
1257	13	yellow	bot-bot_05-828628	2026-03-14 23:07:47.904379
1293	662	red	bot-bot_08-475888	2026-03-14 23:07:50.208772
1300	657	red	bot-bot_10-313249	2026-03-14 23:07:50.310096
1324	760	green	bot-bot_12-919491	2026-03-14 23:07:52.387578
1344	45	yellow	bot-bot_17-265616	2026-03-14 23:07:54.359461
1354	43	green	bot-bot_22-527586	2026-03-14 23:07:56.343809
1359	754	green	bot-bot_22-264902	2026-03-14 23:07:56.441182
1364	663	yellow	bot-bot_25-619806	2026-03-14 23:07:56.541333
1371	758	yellow	bot-bot_24-789953	2026-03-14 23:07:56.644092
1372	710	yellow	bot-bot_21-867371	2026-03-14 23:07:56.735931
1385	2	green	bot-bot_26-246262	2026-03-14 23:07:58.508079
1396	747	green	bot-bot_26-214217	2026-03-14 23:07:58.706872
1397	690	red	bot-bot_30-495909	2026-03-14 23:07:58.795201
1407	686	green	bot-bot_31-594481	2026-03-14 23:08:00.580315
1416	717	red	bot-bot_33-956436	2026-03-14 23:08:00.68426
1450	690	green	bot-bot_37-500412	2026-03-14 23:08:02.932311
1456	691	green	bot-bot_44-716252	2026-03-14 23:08:04.605729
1457	670	green	bot-bot_41-721047	2026-03-14 23:08:04.69819
1472	713	yellow	bot-bot_41-413927	2026-03-14 23:08:05.034939
1482	658	red	bot-bot_50-911536	2026-03-14 23:08:06.81559
1493	711	red	bot-bot_50-649252	2026-03-14 23:08:07.022928
1955	743	green	bot-bot_41-697987	2026-03-14 23:11:12.493481
1957	737	green	bot-bot_45-582994	2026-03-14 23:11:12.586447
1968	765	yellow	bot-bot_44-534723	2026-03-14 23:11:12.808106
1979	737	red	bot-bot_49-326607	2026-03-14 23:11:14.571995
1989	737	red	bot-bot_50-675367	2026-03-14 23:11:14.769884
2000	708	red	bot-bot_46-742295	2026-03-14 23:11:14.968072
1034	679	red	bot-bot_09-449319	2026-03-14 22:59:23.747025
1088	650	red	bot-bot_19-961869	2026-03-14 22:59:28.050371
1123	17	green	bot-bot_23-807223	2026-03-14 22:59:30.331621
876	20	yellow	bot-bot_25-419543	2026-03-14 22:58:38.932607
1140	13	yellow	bot-bot_28-560412	2026-03-14 22:59:32.212121
883	8	red	bot-bot_28-679095	2026-03-14 22:58:40.677496
1159	750	green	bot-bot_32-479776	2026-03-14 22:59:34.161733
1177	663	yellow	bot-bot_40-463424	2026-03-14 22:59:36.13665
1194	748	yellow	bot-bot_39-259828	2026-03-14 22:59:36.452222
1256	44	red	bot-bot_04-935893	2026-03-14 23:07:47.801143
1263	750	yellow	bot-bot_03-618292	2026-03-14 23:07:48.009309
1268	690	green	bot-bot_02-627356	2026-03-14 23:07:48.110995
1271	750	red	bot-bot_01-649627	2026-03-14 23:07:48.116554
948	10	yellow	bot-bot_40-141147	2026-03-14 22:58:45.038077
1277	662	green	bot-bot_07-401847	2026-03-14 23:07:49.905648
1304	723	green	bot-bot_13-129065	2026-03-14 23:07:51.981008
1310	5	green	bot-bot_15-654550	2026-03-14 23:07:52.080901
1312	662	red	bot-bot_14-490172	2026-03-14 23:07:52.183968
1331	714	green	bot-bot_16-231439	2026-03-14 23:07:54.064209
1035	652	green	bot-bot_10-654067	2026-03-14 22:59:23.747542
1053	737	yellow	bot-bot_12-698455	2026-03-14 22:59:25.731118
843	16	yellow	bot-bot_19-660923	2026-03-14 22:58:36.715427
1071	728	green	bot-bot_12-260476	2026-03-14 22:59:26.040583
1089	712	green	bot-bot_20-791327	2026-03-14 22:59:28.056261
1107	3	red	bot-bot_22-274422	2026-03-14 22:59:30.031908
1124	16	yellow	bot-bot_25-793359	2026-03-14 22:59:30.333309
1141	754	green	bot-bot_29-315987	2026-03-14 22:59:32.221891
1160	20	yellow	bot-bot_31-103108	2026-03-14 22:59:34.16429
1178	689	red	bot-bot_38-926665	2026-03-14 22:59:36.149605
869	1	red	bot-bot_22-496586	2026-03-14 22:58:38.813125
881	26	red	bot-bot_30-875127	2026-03-14 22:58:40.586424
888	8	red	bot-bot_28-398816	2026-03-14 22:58:40.774841
1342	22	yellow	bot-bot_19-990349	2026-03-14 23:07:54.354091
1355	765	yellow	bot-bot_24-715509	2026-03-14 23:07:56.345701
1357	4	yellow	bot-bot_21-461990	2026-03-14 23:07:56.43987
1378	1	green	bot-bot_26-596010	2026-03-14 23:07:58.407634
923	10	red	bot-bot_35-926913	2026-03-14 22:58:43.004407
1390	680	yellow	bot-bot_27-907474	2026-03-14 23:07:58.608547
1393	709	red	bot-bot_28-127887	2026-03-14 23:07:58.700373
1400	717	yellow	bot-bot_26-788756	2026-03-14 23:07:58.804892
1404	704	red	bot-bot_32-243478	2026-03-14 23:08:00.485551
1413	748	red	bot-bot_35-953394	2026-03-14 23:08:00.681028
1420	733	red	bot-bot_33-354579	2026-03-14 23:08:00.781155
1423	734	yellow	bot-bot_35-579465	2026-03-14 23:08:00.87628
1430	696	yellow	bot-bot_40-935657	2026-03-14 23:08:02.538191
1433	762	yellow	bot-bot_39-241945	2026-03-14 23:08:02.633301
1443	653	red	bot-bot_40-828159	2026-03-14 23:08:02.828084
1454	714	green	bot-bot_42-952152	2026-03-14 23:08:04.60305
1459	5	yellow	bot-bot_42-582468	2026-03-14 23:08:04.699514
1465	22	green	bot-bot_44-957723	2026-03-14 23:08:04.834035
1468	678	yellow	bot-bot_42-890803	2026-03-14 23:08:04.936336
1478	758	green	bot-bot_46-911361	2026-03-14 23:08:06.717219
1485	734	yellow	bot-bot_48-391367	2026-03-14 23:08:06.819954
1487	715	green	bot-bot_46-423563	2026-03-14 23:08:06.925355
1496	657	yellow	bot-bot_49-997906	2026-03-14 23:08:07.027891
1497	16	yellow	bot-bot_50-638984	2026-03-14 23:08:07.120876
1500	42	yellow	bot-bot_47-482873	2026-03-14 23:08:07.125123
1036	744	red	bot-bot_07-674094	2026-03-14 22:59:23.760379
856	12	green	bot-bot_23-976680	2026-03-14 22:58:38.529148
1072	733	red	bot-bot_11-876334	2026-03-14 22:59:26.134598
1090	697	yellow	bot-bot_18-325866	2026-03-14 22:59:28.061389
1108	680	yellow	bot-bot_23-136701	2026-03-14 22:59:30.03239
1125	671	yellow	bot-bot_24-944488	2026-03-14 22:59:30.338041
1142	759	green	bot-bot_27-925120	2026-03-14 22:59:32.291856
1161	684	yellow	bot-bot_33-276265	2026-03-14 22:59:34.17196
1196	684	red	bot-bot_36-907528	2026-03-14 22:59:36.493446
1506	753	green	bot-bot_01-748199	2026-03-14 23:09:25.229939
1512	760	yellow	bot-bot_04-588099	2026-03-14 23:09:25.427846
884	22	green	bot-bot_29-605554	2026-03-14 22:58:40.679316
1523	754	red	bot-bot_05-227280	2026-03-14 23:09:25.630463
1531	706	green	bot-bot_09-803538	2026-03-14 23:09:27.298062
896	20	red	bot-bot_30-352853	2026-03-14 22:58:40.87911
1532	692	yellow	bot-bot_06-706303	2026-03-14 23:09:27.386408
901	24	green	bot-bot_30-150749	2026-03-14 22:58:40.97455
1545	700	green	bot-bot_08-603517	2026-03-14 23:09:27.594885
1552	665	yellow	bot-bot_11-930710	2026-03-14 23:09:29.374228
1567	748	red	bot-bot_15-593636	2026-03-14 23:09:29.67261
1571	747	red	bot-bot_14-742818	2026-03-14 23:09:29.676131
1575	765	green	bot-bot_14-844447	2026-03-14 23:09:29.774919
966	42	red	bot-bot_44-236101	2026-03-14 22:58:48.763493
968	19	red	bot-bot_42-966134	2026-03-14 22:58:48.793648
985	17	red	bot-bot_48-480743	2026-03-14 22:58:51.971764
990	19	yellow	bot-bot_47-741562	2026-03-14 22:58:52.08143
993	6	yellow	bot-bot_48-789579	2026-03-14 22:58:52.120813
\.


--
-- Data for Name: withdrawal_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.withdrawal_requests (id, user_id, year_month, amount, method, account_info, account_name, status, note, requested_at, processed_at) FROM stdin;
\.


--
-- Name: ad_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ad_campaigns_id_seq', 1, false);


--
-- Name: ad_clicks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ad_clicks_id_seq', 1, false);


--
-- Name: advertiser_balance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.advertiser_balance_id_seq', 1, true);


--
-- Name: balance_topup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.balance_topup_id_seq', 1, false);


--
-- Name: business_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_leads_id_seq', 1, false);


--
-- Name: champion_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.champion_history_id_seq', 1, false);


--
-- Name: collection_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.collection_items_id_seq', 1, false);


--
-- Name: collections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.collections_id_seq', 1, false);


--
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.complaints_id_seq', 1, false);


--
-- Name: game_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_scores_id_seq', 1, false);


--
-- Name: monthly_pool_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monthly_pool_id_seq', 2, true);


--
-- Name: page_owner_revenue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.page_owner_revenue_id_seq', 1, false);


--
-- Name: point_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.point_events_id_seq', 1741, true);


--
-- Name: price_alarms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.price_alarms_id_seq', 2, true);


--
-- Name: prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prices_id_seq', 155, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 1250, true);


--
-- Name: raffle_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.raffle_tickets_id_seq', 1, false);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 563, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 802, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: unique_product_clicks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unique_product_clicks_id_seq', 11, true);


--
-- Name: user_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_accounts_id_seq', 524, true);


--
-- Name: user_daily_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_daily_tasks_id_seq', 6464, true);


--
-- Name: user_follows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_follows_id_seq', 1054, true);


--
-- Name: user_monthly_earnings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_monthly_earnings_id_seq', 1, true);


--
-- Name: user_monthly_points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_monthly_points_id_seq', 358, true);


--
-- Name: user_streak_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_streak_id_seq', 454, true);


--
-- Name: votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.votes_id_seq', 2004, true);


--
-- Name: withdrawal_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.withdrawal_requests_id_seq', 1, false);


--
-- Name: ad_campaigns ad_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_pkey PRIMARY KEY (id);


--
-- Name: ad_clicks ad_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_clicks
    ADD CONSTRAINT ad_clicks_pkey PRIMARY KEY (id);


--
-- Name: advertiser_balance advertiser_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertiser_balance
    ADD CONSTRAINT advertiser_balance_pkey PRIMARY KEY (id);


--
-- Name: advertiser_balance advertiser_balance_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertiser_balance
    ADD CONSTRAINT advertiser_balance_user_id_unique UNIQUE (user_id);


--
-- Name: balance_topup balance_topup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance_topup
    ADD CONSTRAINT balance_topup_pkey PRIMARY KEY (id);


--
-- Name: business_leads business_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_leads
    ADD CONSTRAINT business_leads_pkey PRIMARY KEY (id);


--
-- Name: champion_history champion_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.champion_history
    ADD CONSTRAINT champion_history_pkey PRIMARY KEY (id);


--
-- Name: collection_items collection_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_items
    ADD CONSTRAINT collection_items_pkey PRIMARY KEY (id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: collections collections_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_slug_key UNIQUE (slug);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- Name: game_scores game_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_scores
    ADD CONSTRAINT game_scores_pkey PRIMARY KEY (id);


--
-- Name: monthly_pool monthly_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pool
    ADD CONSTRAINT monthly_pool_pkey PRIMARY KEY (id);


--
-- Name: monthly_pool monthly_pool_year_month_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pool
    ADD CONSTRAINT monthly_pool_year_month_unique UNIQUE (year_month);


--
-- Name: page_owner_revenue page_owner_revenue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_owner_revenue
    ADD CONSTRAINT page_owner_revenue_pkey PRIMARY KEY (id);


--
-- Name: page_owner_revenue page_owner_revenue_product_id_year_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_owner_revenue
    ADD CONSTRAINT page_owner_revenue_product_id_year_month_key UNIQUE (product_id, year_month);


--
-- Name: point_events point_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_events
    ADD CONSTRAINT point_events_pkey PRIMARY KEY (id);


--
-- Name: price_alarms price_alarms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_alarms
    ADD CONSTRAINT price_alarms_pkey PRIMARY KEY (id);


--
-- Name: prices prices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prices
    ADD CONSTRAINT prices_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: raffle_tickets raffle_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raffle_tickets
    ADD CONSTRAINT raffle_tickets_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);


--
-- Name: unique_product_clicks unique_product_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unique_product_clicks
    ADD CONSTRAINT unique_product_clicks_pkey PRIMARY KEY (id);


--
-- Name: user_accounts user_accounts_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_accounts
    ADD CONSTRAINT user_accounts_email_unique UNIQUE (email);


--
-- Name: user_accounts user_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_accounts
    ADD CONSTRAINT user_accounts_pkey PRIMARY KEY (id);


--
-- Name: user_daily_tasks user_daily_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_daily_tasks
    ADD CONSTRAINT user_daily_tasks_pkey PRIMARY KEY (id);


--
-- Name: user_follows user_follows_follower_id_following_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- Name: user_follows user_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_pkey PRIMARY KEY (id);


--
-- Name: user_monthly_earnings user_monthly_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_monthly_earnings
    ADD CONSTRAINT user_monthly_earnings_pkey PRIMARY KEY (id);


--
-- Name: user_monthly_points user_monthly_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_monthly_points
    ADD CONSTRAINT user_monthly_points_pkey PRIMARY KEY (id);


--
-- Name: user_monthly_points user_monthly_points_user_id_year_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_monthly_points
    ADD CONSTRAINT user_monthly_points_user_id_year_month_key UNIQUE (user_id, year_month);


--
-- Name: user_streak user_streak_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_streak
    ADD CONSTRAINT user_streak_pkey PRIMARY KEY (id);


--
-- Name: user_streak user_streak_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_streak
    ADD CONSTRAINT user_streak_user_id_key UNIQUE (user_id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_requests withdrawal_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (id);


--
-- Name: ad_campaigns ad_campaigns_advertiser_id_user_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_advertiser_id_user_accounts_id_fk FOREIGN KEY (advertiser_id) REFERENCES public.user_accounts(id);


--
-- Name: ad_clicks ad_clicks_campaign_id_ad_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_clicks
    ADD CONSTRAINT ad_clicks_campaign_id_ad_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id);


--
-- Name: advertiser_balance advertiser_balance_user_id_user_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertiser_balance
    ADD CONSTRAINT advertiser_balance_user_id_user_accounts_id_fk FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: balance_topup balance_topup_user_id_user_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balance_topup
    ADD CONSTRAINT balance_topup_user_id_user_accounts_id_fk FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: champion_history champion_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.champion_history
    ADD CONSTRAINT champion_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: collection_items collection_items_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_items
    ADD CONSTRAINT collection_items_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;


--
-- Name: collection_items collection_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_items
    ADD CONSTRAINT collection_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: collections collections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: complaints complaints_reporter_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_reporter_user_id_fkey FOREIGN KEY (reporter_user_id) REFERENCES public.user_accounts(id);


--
-- Name: complaints complaints_resolved_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_resolved_by_user_id_fkey FOREIGN KEY (resolved_by_user_id) REFERENCES public.user_accounts(id);


--
-- Name: game_scores game_scores_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_scores
    ADD CONSTRAINT game_scores_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: page_owner_revenue page_owner_revenue_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_owner_revenue
    ADD CONSTRAINT page_owner_revenue_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.user_accounts(id);


--
-- Name: page_owner_revenue page_owner_revenue_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_owner_revenue
    ADD CONSTRAINT page_owner_revenue_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: point_events point_events_user_id_user_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_events
    ADD CONSTRAINT point_events_user_id_user_accounts_id_fk FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: price_alarms price_alarms_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_alarms
    ADD CONSTRAINT price_alarms_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: prices prices_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prices
    ADD CONSTRAINT prices_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: raffle_tickets raffle_tickets_user_id_user_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raffle_tickets
    ADD CONSTRAINT raffle_tickets_user_id_user_accounts_id_fk FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_accounts(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: subscriptions subscriptions_user_id_user_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_user_accounts_id_fk FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: unique_product_clicks unique_product_clicks_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unique_product_clicks
    ADD CONSTRAINT unique_product_clicks_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: user_daily_tasks user_daily_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_daily_tasks
    ADD CONSTRAINT user_daily_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: user_follows user_follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.user_accounts(id);


--
-- Name: user_follows user_follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.user_accounts(id);


--
-- Name: user_monthly_earnings user_monthly_earnings_user_id_user_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_monthly_earnings
    ADD CONSTRAINT user_monthly_earnings_user_id_user_accounts_id_fk FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: user_monthly_points user_monthly_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_monthly_points
    ADD CONSTRAINT user_monthly_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: user_streak user_streak_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_streak
    ADD CONSTRAINT user_streak_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- Name: votes votes_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: withdrawal_requests withdrawal_requests_user_id_user_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_user_id_user_accounts_id_fk FOREIGN KEY (user_id) REFERENCES public.user_accounts(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Uy9nbPPOLUQcsugQwacqXv9qtVhPLPpjQHrMN2aMvfd1VEbmPjgfX064mWweE7N

