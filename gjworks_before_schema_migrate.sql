--
-- PostgreSQL database dump
--

\restrict sFpLDJ7WXej27i5X8G9s4sTIknFQmWstlNXCMUo3P6udqfgXSsvntuQZR1oIlO4

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: gjworks
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO gjworks;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: gjworks
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: gjworks
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    title character varying(45) NOT NULL,
    "desc" text,
    color character varying(45),
    "moduleId" integer NOT NULL
);


ALTER TABLE public."Category" OWNER TO gjworks;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: gjworks
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO gjworks;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gjworks
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: Document; Type: TABLE; Schema: public; Owner: gjworks
--

CREATE TABLE public."Document" (
    id integer NOT NULL,
    "moduleId" integer NOT NULL,
    "categoryId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    published boolean DEFAULT false,
    "userId" integer,
    "authorName" character varying(45),
    "authorPassword" text,
    title character varying(255),
    content text,
    "isNotice" boolean DEFAULT false,
    "isSecrets" boolean DEFAULT false,
    "readCount" integer DEFAULT 0,
    "commentCount" integer DEFAULT 0,
    "voteCount" integer DEFAULT 0
);


ALTER TABLE public."Document" OWNER TO gjworks;

--
-- Name: Document_id_seq; Type: SEQUENCE; Schema: public; Owner: gjworks
--

CREATE SEQUENCE public."Document_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Document_id_seq" OWNER TO gjworks;

--
-- Name: Document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gjworks
--

ALTER SEQUENCE public."Document_id_seq" OWNED BY public."Document".id;


--
-- Name: Module; Type: TABLE; Schema: public; Owner: gjworks
--

CREATE TABLE public."Module" (
    id integer NOT NULL,
    mid text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "moduleType" character varying(45),
    "moduleName" text NOT NULL,
    "moduleDesc" text,
    "grant" json,
    config json,
    status character varying(45)
);


ALTER TABLE public."Module" OWNER TO gjworks;

--
-- Name: Module_id_seq; Type: SEQUENCE; Schema: public; Owner: gjworks
--

CREATE SEQUENCE public."Module_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Module_id_seq" OWNER TO gjworks;

--
-- Name: Module_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gjworks
--

ALTER SEQUENCE public."Module_id_seq" OWNED BY public."Module".id;


--
-- Name: Profile; Type: TABLE; Schema: public; Owner: gjworks
--

CREATE TABLE public."Profile" (
    id integer NOT NULL,
    phone text NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."Profile" OWNER TO gjworks;

--
-- Name: Profile_id_seq; Type: SEQUENCE; Schema: public; Owner: gjworks
--

CREATE SEQUENCE public."Profile_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Profile_id_seq" OWNER TO gjworks;

--
-- Name: Profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gjworks
--

ALTER SEQUENCE public."Profile_id_seq" OWNED BY public."Profile".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: gjworks
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    uuid text NOT NULL,
    "accountId" text NOT NULL,
    email_address text NOT NULL,
    "nickName" text NOT NULL,
    password text NOT NULL,
    "refreshToken" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updateAt" timestamp(3) without time zone NOT NULL,
    "isAdmin" boolean,
    "isManagers" boolean
);


ALTER TABLE public."User" OWNER TO gjworks;

--
-- Name: UserGroup; Type: TABLE; Schema: public; Owner: gjworks
--

CREATE TABLE public."UserGroup" (
    id integer NOT NULL,
    "groupName" text NOT NULL,
    "groupTitle" character varying(45) NOT NULL,
    "groupDesc" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserGroup" OWNER TO gjworks;

--
-- Name: UserGroupUser; Type: TABLE; Schema: public; Owner: gjworks
--

CREATE TABLE public."UserGroupUser" (
    id integer NOT NULL,
    "groupId" integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserGroupUser" OWNER TO gjworks;

--
-- Name: UserGroupUser_id_seq; Type: SEQUENCE; Schema: public; Owner: gjworks
--

CREATE SEQUENCE public."UserGroupUser_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserGroupUser_id_seq" OWNER TO gjworks;

--
-- Name: UserGroupUser_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gjworks
--

ALTER SEQUENCE public."UserGroupUser_id_seq" OWNED BY public."UserGroupUser".id;


--
-- Name: UserGroup_id_seq; Type: SEQUENCE; Schema: public; Owner: gjworks
--

CREATE SEQUENCE public."UserGroup_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserGroup_id_seq" OWNER TO gjworks;

--
-- Name: UserGroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gjworks
--

ALTER SEQUENCE public."UserGroup_id_seq" OWNED BY public."UserGroup".id;


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: gjworks
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO gjworks;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gjworks
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: gjworks
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO gjworks;

--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: Document id; Type: DEFAULT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Document" ALTER COLUMN id SET DEFAULT nextval('public."Document_id_seq"'::regclass);


--
-- Name: Module id; Type: DEFAULT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Module" ALTER COLUMN id SET DEFAULT nextval('public."Module_id_seq"'::regclass);


--
-- Name: Profile id; Type: DEFAULT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Profile" ALTER COLUMN id SET DEFAULT nextval('public."Profile_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserGroup id; Type: DEFAULT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."UserGroup" ALTER COLUMN id SET DEFAULT nextval('public."UserGroup_id_seq"'::regclass);


--
-- Name: UserGroupUser id; Type: DEFAULT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."UserGroupUser" ALTER COLUMN id SET DEFAULT nextval('public."UserGroupUser_id_seq"'::regclass);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: gjworks
--

COPY public."Category" (id, title, "desc", color, "moduleId") FROM stdin;
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: gjworks
--

COPY public."Document" (id, "moduleId", "categoryId", "createdAt", "updatedAt", published, "userId", "authorName", "authorPassword", title, content, "isNotice", "isSecrets", "readCount", "commentCount", "voteCount") FROM stdin;
\.


--
-- Data for Name: Module; Type: TABLE DATA; Schema: public; Owner: gjworks
--

COPY public."Module" (id, mid, "createdAt", "updatedAt", "moduleType", "moduleName", "moduleDesc", "grant", config, status) FROM stdin;
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: gjworks
--

COPY public."Profile" (id, phone, "userId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: gjworks
--

COPY public."User" (id, uuid, "accountId", email_address, "nickName", password, "refreshToken", "createdAt", "updateAt", "isAdmin", "isManagers") FROM stdin;
1	cm7466sq100001iwhrwo1mcf5	gjworks	gjworks	gjworks	U2FsdGVkX19r2gpQUXNnBMl7rczOaPLjQePzxKNsCMI=	\N	2025-02-14 02:49:06.025	2025-02-14 02:49:06.025	\N	\N
2	cm7id5ybc00001imikmow640w	gjwork2	gjwork2	gjworks2	U2FsdGVkX1/8ua/9btMZrAmISZRajNBgAZyuKFEHo3Q=	\N	2025-02-24 01:13:10.393	2025-02-24 01:13:10.393	\N	\N
3	cm7ik2kor00021imiekuj1d7j	gggg	gggg	gggg	U2FsdGVkX1/dWaKjj1jj5yPCf8OKODL82Iy+B8cCrGI=	\N	2025-02-24 04:26:30.076	2025-02-24 04:26:30.076	\N	\N
4	cm7mp8icr00041imibc8ef0l1	gjworks1	gjworks1	gjworks1	GTl3c7ByRPsogKLPCFpYyA==	\N	2025-02-27 02:02:09.772	2025-02-27 02:02:09.772	\N	\N
\.


--
-- Data for Name: UserGroup; Type: TABLE DATA; Schema: public; Owner: gjworks
--

COPY public."UserGroup" (id, "groupName", "groupTitle", "groupDesc", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserGroupUser; Type: TABLE DATA; Schema: public; Owner: gjworks
--

COPY public."UserGroupUser" (id, "groupId", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: gjworks
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
da6f96d8-5179-4865-9501-72efd5ec61ec	74f1a7ce8488a48ab039cbd10d5a0d9fcacbd47f58afe54a8635c08fb1895022	2025-02-14 02:48:06.810996+00	20250214024806_init	\N	\N	2025-02-14 02:48:06.780837+00	1
\.


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gjworks
--

SELECT pg_catalog.setval('public."Category_id_seq"', 1, false);


--
-- Name: Document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gjworks
--

SELECT pg_catalog.setval('public."Document_id_seq"', 1, false);


--
-- Name: Module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gjworks
--

SELECT pg_catalog.setval('public."Module_id_seq"', 1, false);


--
-- Name: Profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gjworks
--

SELECT pg_catalog.setval('public."Profile_id_seq"', 1, false);


--
-- Name: UserGroupUser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gjworks
--

SELECT pg_catalog.setval('public."UserGroupUser_id_seq"', 1, false);


--
-- Name: UserGroup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gjworks
--

SELECT pg_catalog.setval('public."UserGroup_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gjworks
--

SELECT pg_catalog.setval('public."User_id_seq"', 4, true);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: Module Module_pkey; Type: CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Module"
    ADD CONSTRAINT "Module_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: UserGroupUser UserGroupUser_pkey; Type: CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."UserGroupUser"
    ADD CONSTRAINT "UserGroupUser_pkey" PRIMARY KEY (id);


--
-- Name: UserGroup UserGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."UserGroup"
    ADD CONSTRAINT "UserGroup_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Module_mid_key; Type: INDEX; Schema: public; Owner: gjworks
--

CREATE UNIQUE INDEX "Module_mid_key" ON public."Module" USING btree (mid);


--
-- Name: Module_moduleName_key; Type: INDEX; Schema: public; Owner: gjworks
--

CREATE UNIQUE INDEX "Module_moduleName_key" ON public."Module" USING btree ("moduleName");


--
-- Name: Profile_phone_key; Type: INDEX; Schema: public; Owner: gjworks
--

CREATE UNIQUE INDEX "Profile_phone_key" ON public."Profile" USING btree (phone);


--
-- Name: Profile_userId_key; Type: INDEX; Schema: public; Owner: gjworks
--

CREATE UNIQUE INDEX "Profile_userId_key" ON public."Profile" USING btree ("userId");


--
-- Name: UserGroup_groupName_key; Type: INDEX; Schema: public; Owner: gjworks
--

CREATE UNIQUE INDEX "UserGroup_groupName_key" ON public."UserGroup" USING btree ("groupName");


--
-- Name: User_accountId_key; Type: INDEX; Schema: public; Owner: gjworks
--

CREATE UNIQUE INDEX "User_accountId_key" ON public."User" USING btree ("accountId");


--
-- Name: User_email_address_key; Type: INDEX; Schema: public; Owner: gjworks
--

CREATE UNIQUE INDEX "User_email_address_key" ON public."User" USING btree (email_address);


--
-- Name: User_nickName_key; Type: INDEX; Schema: public; Owner: gjworks
--

CREATE UNIQUE INDEX "User_nickName_key" ON public."User" USING btree ("nickName");


--
-- Name: Category Category_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Document Document_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Document Document_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Profile Profile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserGroupUser UserGroupUser_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."UserGroupUser"
    ADD CONSTRAINT "UserGroupUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."UserGroup"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserGroupUser UserGroupUser_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gjworks
--

ALTER TABLE ONLY public."UserGroupUser"
    ADD CONSTRAINT "UserGroupUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: gjworks
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict sFpLDJ7WXej27i5X8G9s4sTIknFQmWstlNXCMUo3P6udqfgXSsvntuQZR1oIlO4

