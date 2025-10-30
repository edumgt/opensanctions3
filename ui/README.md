## DB SQL 2025.10.30

-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP SEQUENCE public.position_id_seq;

CREATE SEQUENCE public.position_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.position_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.position_id_seq TO postgres;

-- DROP SEQUENCE public.program_id_seq;

CREATE SEQUENCE public.program_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.program_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.program_id_seq TO postgres;

-- DROP SEQUENCE public.resolver_id_seq;

CREATE SEQUENCE public.resolver_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.resolver_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.resolver_id_seq TO postgres;

-- DROP SEQUENCE public.review_id_seq;

CREATE SEQUENCE public.review_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.review_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.review_id_seq TO postgres;
-- public."cache" definition

-- Drop table

-- DROP TABLE public."cache";

CREATE TABLE public."cache" ( "key" varchar NOT NULL, "text" varchar NULL, dataset varchar NOT NULL, "timestamp" timestamp NULL, CONSTRAINT cache_pkey PRIMARY KEY (key));
CREATE INDEX ix_cache_timestamp ON public.cache USING btree ("timestamp");

-- Permissions

ALTER TABLE public."cache" OWNER TO postgres;
GRANT ALL ON TABLE public."cache" TO postgres;


-- public.entity_flattened definition

-- Drop table

-- DROP TABLE public.entity_flattened;

CREATE TABLE public.entity_flattened ( entity_id varchar(255) NOT NULL, "schema" varchar(255) NULL, dataset varchar(255) NULL, "name" varchar(65535) NULL, alias varchar(65535) NULL, first_name varchar(65535) NULL, last_name varchar(65535) NULL, birth_date varchar(255) NULL, country varchar(255) NULL, nationality varchar(255) NULL, gender varchar(255) NULL, address varchar(65535) NULL, passport_number varchar(255) NULL, id_number varchar(255) NULL, source_url varchar(65535) NULL, topics varchar(2000) NULL, CONSTRAINT entity_flattened_pkey PRIMARY KEY (entity_id));
CREATE INDEX entity_flattened_address_idx ON public.entity_flattened USING btree (address);
CREATE INDEX entity_flattened_alias_idx ON public.entity_flattened USING btree (alias);
CREATE INDEX entity_flattened_country_idx ON public.entity_flattened USING btree (country);
CREATE INDEX entity_flattened_dataset_idx ON public.entity_flattened USING btree (dataset);
CREATE INDEX entity_flattened_first_name_idx ON public.entity_flattened USING btree (first_name);
CREATE INDEX entity_flattened_id_number_idx ON public.entity_flattened USING btree (id_number);
CREATE INDEX entity_flattened_last_name_idx ON public.entity_flattened USING btree (last_name);
CREATE INDEX entity_flattened_name_idx ON public.entity_flattened USING btree (name);
CREATE INDEX entity_flattened_nationality_idx ON public.entity_flattened USING btree (nationality);
CREATE INDEX entity_flattened_schema_idx ON public.entity_flattened USING btree (schema);
CREATE INDEX entity_flattened_topics_idx ON public.entity_flattened USING btree (topics);

-- Permissions

ALTER TABLE public.entity_flattened OWNER TO postgres;
GRANT ALL ON TABLE public.entity_flattened TO postgres;


-- public.nation_code definition

-- Drop table

-- DROP TABLE public.nation_code;

CREATE TABLE public.nation_code ( code varchar(10) NOT NULL, nation_kor varchar(100) NULL, count int8 NULL, CONSTRAINT nation_code_pkey PRIMARY KEY (code));
CREATE INDEX nation_code_nation_kor_idx ON public.nation_code USING btree (nation_kor);

-- Permissions

ALTER TABLE public.nation_code OWNER TO postgres;
GRANT ALL ON TABLE public.nation_code TO postgres;


-- public."position" definition

-- Drop table

-- DROP TABLE public."position";

CREATE TABLE public."position" ( id serial4 NOT NULL, entity_id varchar(255) NOT NULL, caption varchar(65535) NOT NULL, countries json NOT NULL, is_pep bool NULL, topics json NOT NULL, dataset varchar(65535) NOT NULL, created_at timestamp NOT NULL, modified_at timestamp NULL, modified_by varchar(255) NULL, deleted_at timestamp NULL, CONSTRAINT position_pkey PRIMARY KEY (id));
CREATE INDEX ix_position_created_at ON public."position" USING btree (created_at);
CREATE INDEX ix_position_deleted_at ON public."position" USING btree (deleted_at);
CREATE INDEX ix_position_entity_id ON public."position" USING btree (entity_id);

-- Permissions

ALTER TABLE public."position" OWNER TO postgres;
GRANT ALL ON TABLE public."position" TO postgres;


-- public."program" definition

-- Drop table

-- DROP TABLE public."program";

CREATE TABLE public."program" ( id serial4 NOT NULL, "key" varchar(255) NOT NULL, title varchar(65535) NULL, url varchar(65535) NULL, CONSTRAINT program_key_key UNIQUE (key), CONSTRAINT program_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public."program" OWNER TO postgres;
GRANT ALL ON TABLE public."program" TO postgres;


-- public.resolver definition

-- Drop table

-- DROP TABLE public.resolver;

CREATE TABLE public.resolver ( id serial4 NOT NULL, target varchar(512) NULL, "source" varchar(512) NULL, judgement varchar(14) NOT NULL, score float8 NULL, "user" varchar(512) NOT NULL, created_at varchar(28) NULL, deleted_at varchar(28) NULL, CONSTRAINT resolver_pkey PRIMARY KEY (id));
CREATE INDEX ix_resolver_source ON public.resolver USING btree (source);
CREATE INDEX ix_resolver_target ON public.resolver USING btree (target);
CREATE UNIQUE INDEX resolver_source_target_uniq ON public.resolver USING btree (source, target) WHERE (deleted_at IS NULL);

-- Permissions

ALTER TABLE public.resolver OWNER TO postgres;
GRANT ALL ON TABLE public.resolver TO postgres;


-- public.review definition

-- Drop table

-- DROP TABLE public.review;

CREATE TABLE public.review ( id serial4 NOT NULL, "key" varchar(255) NOT NULL, dataset varchar(255) NOT NULL, extraction_schema json NOT NULL, source_value varchar(1048576) NULL, source_mime_type varchar(65535) NULL, source_label varchar(65535) NULL, source_url varchar(65535) NULL, accepted bool NOT NULL, crawler_version int4 NOT NULL, original_extraction json NOT NULL, origin varchar(65535) NOT NULL, extracted_data json NOT NULL, last_seen_version varchar(255) NOT NULL, modified_at timestamp NOT NULL, modified_by varchar(255) NOT NULL, deleted_at timestamp NULL, CONSTRAINT review_pkey PRIMARY KEY (id));
CREATE INDEX ix_review_accepted ON public.review USING btree (accepted);
CREATE INDEX ix_review_dataset ON public.review USING btree (dataset);
CREATE INDEX ix_review_deleted_at ON public.review USING btree (deleted_at);
CREATE INDEX ix_review_key ON public.review USING btree (key);
CREATE UNIQUE INDEX ix_review_key_dataset_unique_not_deleted ON public.review USING btree (key, dataset) WHERE (deleted_at IS NULL);
CREATE INDEX ix_review_last_seen_version ON public.review USING btree (last_seen_version);

-- Permissions

ALTER TABLE public.review OWNER TO postgres;
GRANT ALL ON TABLE public.review TO postgres;


-- public."statement" definition

-- Drop table

-- DROP TABLE public."statement";

CREATE TABLE public."statement" ( id varchar(255) NOT NULL, entity_id varchar(255) NOT NULL, canonical_id varchar(255) NOT NULL, prop varchar(255) NOT NULL, prop_type varchar(255) NOT NULL, "schema" varchar(255) NOT NULL, value varchar(65535) NOT NULL, original_value varchar(65535) NULL, dataset varchar(255) NULL, origin varchar(255) NULL, lang varchar(255) NULL, "external" bool NOT NULL, first_seen timestamp NULL, last_seen timestamp NULL, CONSTRAINT statement_pkey PRIMARY KEY (id));
CREATE INDEX ix_statement_canonical_id ON public.statement USING btree (canonical_id);
CREATE INDEX ix_statement_dataset ON public.statement USING btree (dataset);
CREATE INDEX ix_statement_entity_id ON public.statement USING btree (entity_id);
CREATE INDEX ix_statement_origin ON public.statement USING btree (origin);
CREATE INDEX ix_statement_prop ON public.statement USING btree (prop);
CREATE INDEX ix_statement_prop_type ON public.statement USING btree (prop_type);
CREATE INDEX ix_statement_schema ON public.statement USING btree (schema);

-- Permissions

ALTER TABLE public."statement" OWNER TO postgres;
GRANT ALL ON TABLE public."statement" TO postgres;




-- Permissions

GRANT ALL ON SCHEMA public TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO public;