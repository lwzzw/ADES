const express = require("express");
const app = express();
const path = require('path');
const createHttpErrors = require('http-errors');
const ApiRouter = require('./router/api');
const db = require("./database/database");
const port = require("./config").PORT;
const fs = require('fs');
// const port = 3001;

db.connect()
	.then(() => {
		db.query(`
DROP TABLE IF EXISTS order_history;
CREATE TABLE IF NOT EXISTS order_history (
	id SERIAL primary key,
	user_id int not null,
	detail_id int not null,
	total NUMERIC(12,2) not null,
    buydate DATE not null
);
DROP TABLE IF EXISTS order_detail;
CREATE TABLE IF NOT EXISTS order_detail (
	id SERIAL primary key,
	order_id int not null,
	g_id int not null,
	amount int not null
);

DROP TABLE IF EXISTS user_detail;
CREATE TABLE IF NOT EXISTS user_detail (
	id SERIAL primary key,
	name varchar(50) not null,
	email varchar(255) not null,
	password varchar(255) not null,
	gender int null,
	c_card numeric(12) null,
	phone varchar(255) null
);
    
DROP TABLE IF EXISTS G2A_gameDatabase;
CREATE TABLE IF NOT EXISTS G2A_gameDatabase (
	g_id SERIAL primary key,
	g_name VARCHAR (50) not null,
	g_platform VARCHAR (50) null,
	g_price NUMERIC(12,2) not null,
	g_description VARCHAR null,
	g_maincategory INT not null,
	g_parentSubcategory INT null,
	g_childSubcategory INT null,
	g_image VARCHAR (255) null,
	g_publishDate DATE not null,
	g_region int null,
    g_discount NUMERIC(12,2) null
);

DROP TABLE IF EXISTS region;
CREATE TABLE IF NOT EXISTS region (
	id SERIAL primary key,
	region_name VARCHAR (50) not null
);
DROP TABLE IF EXISTS child_subcategory;
CREATE TABLE IF NOT EXISTS child_subcategory (
	id SERIAL primary key,
	category_name VARCHAR (50) not null,
	fk_parent INT not null
);
DROP TABLE IF EXISTS parent_subcategory;
CREATE TABLE IF NOT EXISTS parent_subcategory (
	id SERIAL primary key,
	category_name VARCHAR (50) not null,
	fk_main INT not null
);
DROP TABLE IF EXISTS main_category;
CREATE TABLE IF NOT EXISTS main_category (
	id SERIAL primary key,
	category_name VARCHAR (50) not null
);

ALTER TABLE G2A_gameDatabase
	ADD CONSTRAINT fk_main FOREIGN KEY(g_maincategory) REFERENCES main_category(id),
	ADD CONSTRAINT fk_parent FOREIGN KEY(g_parentSubcategory) REFERENCES parent_subcategory(id),
	ADD CONSTRAINT fk_child FOREIGN KEY(g_childSubcategory) REFERENCES child_subcategory(id),
	ADD CONSTRAINT fk_region FOREIGN KEY(g_region) REFERENCES region(id);

ALTER TABLE parent_subcategory
	ADD CONSTRAINT fk_main_cat FOREIGN KEY(fk_main) REFERENCES main_category(id);

ALTER TABLE child_subcategory
	ADD CONSTRAINT fk_parent_cat FOREIGN KEY(fk_parent) REFERENCES parent_subcategory(id);

    ALTER TABLE order_history
	ADD CONSTRAINT fk_history_user FOREIGN KEY(user_id) REFERENCES user_detail(id);
	
ALTER TABLE order_detail
	ADD CONSTRAINT fk_history_detail FOREIGN KEY(g_id) REFERENCES G2A_gameDatabase(g_id);

INSERT INTO public.main_category (category_name) VALUES ('Video games');
INSERT INTO public.main_category (category_name) VALUES ('Software');
INSERT INTO public.main_category (category_name) VALUES ('Gaming Hardware');

INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('Steam Games', 1);
INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('Xbox Live Games', 1);
INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('PSN Games', 1);
INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('Battle.net Games', 1);
INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('Nintendo Games', 1);
INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('Origin Games', 1);
INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('Ubisoft Games', 1);
INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('GOG Games', 1);
INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('Operation System', 2);
INSERT INTO public.parent_subcategory (category_name, fk_main) VALUES ('PC', 3);

INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Adventure Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action & Shooting Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('RPG Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Simulator Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Indie Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Casual Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('MMO Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Sports Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Arcade Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Strategy Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Racing Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Fighting Games', 1);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Economy Games', 1);

INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Adventure Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action & Shooting Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('RPG Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Simulator Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Indie Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Casual Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('MMO Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Sports Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Arcade Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Strategy Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Racing Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Fighting Games', 2);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Economy Games', 2);

INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Adventure Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action & Shooting Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('RPG Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Simulator Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Indie Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Casual Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('MMO Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Sports Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Arcade Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Strategy Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Racing Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Fighting Games', 3);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Economy Games', 3);

INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Adventure Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action & Shooting Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('RPG Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Simulator Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Indie Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Casual Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('MMO Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Sports Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Arcade Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Strategy Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Racing Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Fighting Games', 4);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Economy Games', 4);

INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Adventure Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action & Shooting Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('RPG Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Simulator Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Indie Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Casual Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('MMO Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Sports Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Arcade Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Strategy Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Racing Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Fighting Games', 5);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Economy Games', 5);

INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Adventure Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action & Shooting Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('RPG Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Simulator Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Indie Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Casual Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('MMO Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Sports Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Arcade Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Strategy Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Racing Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Fighting Games', 6);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Economy Games', 6);

INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Adventure Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action & Shooting Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('RPG Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Simulator Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Indie Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Casual Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('MMO Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Sports Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Arcade Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Strategy Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Racing Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Fighting Games', 7);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Economy Games', 7);

INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Adventure Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action & Shooting Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('RPG Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Simulator Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Indie Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Casual Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('MMO Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Sports Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Arcade Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Strategy Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Racing Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Fighting Games', 8);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Economy Games', 8);

INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Adventure Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Action & Shooting Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('RPG Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Simulator Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Indie Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Casual Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('MMO Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Sports Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Arcade Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Strategy Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Racing Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Fighting Games', 9);
INSERT INTO public.child_subcategory (category_name, fk_parent) VALUES ('Economy Games', 9);

INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 1', 40, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11', 20);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 2', 50, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11', 30);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 3', 10, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 4', 60, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11', 50);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 5', 10, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 6', 10, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 7', 10, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 8', 15, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11', 10);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 9', 10, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 10', 9, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11',5);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 11', 10, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 12', 10, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 13', 10, 'description', 1, 1, 1, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 14', 10, 'description', 1, 1, 1, '/images/poop.png', '2022/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 15', 10, 'description', 1, 1, 1, '/images/poop.png', '2022/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 16', 120, 'description', 1, 1, 2, '/images/poop.png', '2022/10/11', 99);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 17', 10, 'description', 1, 1, 2, '/images/poop.png', '2021/9/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 18', 85.90, 'description', 1, 1, 2, '/images/poop.png', '2021/11/11', 42.95);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 19', 10, 'description', 1, 1, 2, '/images/poop.png', '2020/10/22');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 20', 10, 'description', 1, 1, 2, '/images/poop.png', '2021/11/10');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 21', 200, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11',120.55);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 22', 10, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 23', 10, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate) 
VALUES ('game name 24', 10, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11');
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 25', 200, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11',79.99);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 26', 108, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11',100.50);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 27', 17, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11', 5);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 28', 79.90, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11', 23.97);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 29', 82.50, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11', 27.22);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount) 
VALUES ('game name 30', 69.90, 'description', 1, 1, 2, '/images/poop.png', '2020/10/11', 41.94);

INSERT INTO public.user_detail (name, email, password, c_card, phone) VALUES ('Junheng', 'junheng.tan@hotmail.com', '123password', 1, 85529404);

INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (1, 3762, 1, 10);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (2, 3762, 1, 9);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (3, 3762, 2, 8);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (4, 3762, 4, 7);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (5, 3762, 1, 6);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (6, 3762, 1, 5);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (7, 3762, 8, 4);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (8, 3762, 2, 3);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (9, 3762, 4, 2);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (10, 3762, 1, 1);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (11, 3762, 10, 20);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (12, 3762, 16, 25);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (13, 3762, 21, 30);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (14, 3762, 30, 12);
INSERT INTO public.order_detail (id, order_id, g_id, amount) VALUES (15, 3762, 29, 17);

INSERT INTO public.order_history (user_id, detail_id, buydate, total)
SELECT 1,(order_detail.order_id), current_timestamp,(order_detail.amount * COALESCE(g_discount, g_price)) FROM public.order_detail INNER JOIN g2a_gamedatabase ON order_detail.g_id = g2a_gamedatabase.g_id;

     `)
	})
	.catch(err => {
		console.log(err)
	})

app.use(express.json());

app.use((req, res, next) => {
	console.log(req.originalUrl);
	next();
})

app.use((req, res, next) => {
	if (req.path.includes("category.html")) {
		res.sendFile(path.join(__dirname, '/public/html/category.html'));
	} else {
		next()
	}
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));

app.use(ApiRouter);

// 404 Handler
app.use((req, res, next) => {
	console.log('404');
	next(createHttpErrors(404, `Unknown Resource ${req.method} ${req.originalUrl}`));
});

// Error Handler
app.use((error, req, res, next) => {
	console.error(error);
	return res.status(error.status || 500).json({
		error: error.message || `Unknown Error!`,
		status: error.status
	});
});

app.listen(port, () => {
	console.log(`App listen on port http://localhost:${port}`);
});