const express = require("express");
const app = express();
const path = require('path');
const createHttpErrors = require('http-errors');
const ApiRouter = require('./router/api');
const db = require("./database/database");
const port = require("./config").PORT;
app.set("view engine", "ejs")

db.connect()
	.then(() => {
		db.query(`
DROP TABLE IF EXISTS cart;
CREATE TABLE IF NOT EXISTS cart (
	id SERIAL primary key,
	user_id bigint not null,
	game_id int not null,
	amount int not null
);

DROP TABLE IF EXISTS order_history;
CREATE TABLE IF NOT EXISTS order_history (
	id SERIAL primary key,
	user_id bigint not null,
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
	gender varchar(2) null,
	c_card numeric(12) null,
	phone varchar(255) null
);
    
DROP TABLE IF EXISTS G2A_gameDatabase;
CREATE TABLE IF NOT EXISTS G2A_gameDatabase (
	g_id SERIAL primary key,
	g_name VARCHAR (255) not null,
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

ALTER TABLE cart
	ADD CONSTRAINT fk_cart_game FOREIGN KEY(game_id) REFERENCES G2A_gameDatabase(g_id);
	
ALTER TABLE order_detail
	ADD CONSTRAINT fk_history_detail FOREIGN KEY(g_id) REFERENCES G2A_gameDatabase(g_id);

ALTER TABLE IF EXISTS public.order_history ADD CONSTRAINT fk_orderid FOREIGN KEY (id) REFERENCES public.order_detail (order_id)

DROP FUNCTION IF EXISTS insert_cart;
CREATE FUNCTION insert_cart (uid bigint, gid int, quantity int, edit varchar(20))
	returns int
	language plpgsql
as
$$
declare q int;
BEGIN
	IF NOT EXISTS (SELECT 1 FROM cart where user_id = uid and game_id = gid) and quantity > 0
	then
		INSERT INTO cart (user_id, game_id, amount) VALUES (uid, gid, 1);
	else
		IF quantity = 1 and edit !='true'
		then
			q = (select amount from cart where user_id = uid and game_id = gid);
			update cart set amount = q + quantity where user_id = uid and game_id = gid;
		elseif quantity > 99
		then
			update cart set amount = 99 where user_id = uid and game_id = gid;
		elseif quantity < 1
		then
			delete from cart where user_id = uid and game_id = gid;
		else
			update cart set amount = quantity where user_id = uid and game_id = gid;
		end if;
	end if;
	RETURN 1;
END ;
$$;
INSERT INTO public.region (region_name) VALUES ('ASIA');
INSERT INTO public.region (region_name) VALUES ('Middle-East');
INSERT INTO public.region (region_name) VALUES ('EUROPE');

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

INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Battlefield 2042 (PC) - Origin Key - GLOBAL', 40, 'a first person game which requires strategies in order to defeat the enemies', 1, 1, 1, '/images/noimage.png', '2020/10/11', 20, 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Jurassic World Evolution 2  Deluxe Edition (PC) - Steam Key - GLOBAL', 50, 'a story based game which stimulates the players to solve mysteries surrounding the dinosaurs', 1, 1, 1, '/images/noimage.png', '2020/10/11', 30, 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Marvels Guardians of the Galaxy (PC) - Steam Key - GLOBAL', 10, 'a FPS game which can be played in both story mode and battle mode with friends', 1, 1, 1, '/images/noimage.png', '2020/10/11', 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Age of Empires IV (PC) - Steam Key - GLOBAL', 60, 'Age of Empires IV is another installment in the series of classic strategy games known all over the world.', 1, 1, 1, '/images/noimage.png', '2020/10/11', 50, 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Football Manager 2022 (PC) - Steam Key - EUROPE', 10, 'a sports game with complex control and a third person game allowing players to create a team of players.', 1, 1, 1, '/images/noimage.png', '2020/10/11', 2);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Grand Theft Auto V: Premium Online Edition (PC) - Rockstar Key - GLOBAL', 10, 'Experience Rockstar Games’ critically acclaimed open world game, Grand Theft Auto V.', 1, 1, 1, '/images/noimage.png', '2020/10/11', 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Minecraft Java Edition Minecraft Key GLOBAL', 10, 'a popular game that allows user to play in different mode such as creative mode and is suitable for all age', 1, 1, 1, '/images/noimage.png', '2020/10/11', 2);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Going Medieval (PC) - Steam Key - GLOBAL', 15, 'Going Medieval is a city-building game that allows you to immerse yourself in the Dark Ages.', 1, 1, 1, '/images/noimage.png', '2020/10/11', 10, 3);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Gloomhaven (PC) - Steam Key - GLOBAL', 10, 'Whether you are drawn to Gloomhaven by the call of adventure or by an avid desire for gold glimmering in the dark', 1, 1, 1, '/images/noimage.png', '2020/10/11', 3);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('The Dark Pictures Anthology: House of Ashes (PC) - Steam Key - GLOBAL', 9, 'Man of Medan is an interactive drama survival horror video game developed.', 1, 1, 1, '/images/noimage.png', '2020/10/11',5, 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('The Jackbox Party Pack 8 (PC) - Steam Key - GLOBAL', 10, 'a fun party favourtite played among families and is suitable for all ages', 1, 1, 1, '/images/noimage.png', '2020/10/11', 2);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('The Sims 4 (PC) - Origin Key - GLOBAL', 10, 'a fun The Sims 4 is full of improvements and new solutions to make your Sims even more relatable', 1, 1, 1, '/images/noimage.png', '2020/10/11', 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('NBA 2K22 | 75th Anniversary Edition (PC) - Steam Key - GLOBAL', 10, 'a sports game that allows palyers to play basketball as famous known nba players', 1, 1, 1, '/images/noimage.png', '2020/10/11', 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Resident Evil 8: Village (PC) - Steam Key - GLOBAL', 10, 'Once again, players will step into the role of Ethan Winters who embarks on a dangerous journey.', 1, 1, 1, '/images/noimage.png', '2022/10/11', 3);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Red Dead Redemption 2 (Ultimate Edition) - Rockstar Key - GLOBAL', 10, 'An action-adventure game it was released on Xbox One and PlayStation 4, and since 2019 it is also available on the PC.', 1, 1, 1, '/images/noimage.png', '2022/10/11', 3);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Dark Souls III Deluxe Edition (PC) - Steam Key - GLOBAL', 120, 'A classic RPG system, in which you control your character from a third-person point of view.', 1, 1, 2, '/images/noimage.png', '2022/10/11', 99, 3);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Snowrunner | Premium Edition (PC) - Steam Key - GLOBAL - 1', 10, 'In MudRunner players may experience driving off-road vehicles in difficult and dangerous terrain', 1, 1, 2, '/images/noimage.png', '2021/9/11', 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Battlefield 1 Revolution Origin Key GLOBAL', 85.90, 'An action FPS game which players can experience fighting in a war battlefield', 1, 1, 2, '/images/noimage.png', '2021/11/11', 42.95, 2);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Need for Speed Heat (PC) - Origin Key - GLOBAL - 1', 10, 'A fun and simple car racing game where players play against each other in real-time', 1, 1, 2, '/images/noimage.png', '2020/10/22', 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Tabletop Simulator Steam Gift GLOBAL', 10, 'here are no rules to follow: just you with a physics sandbox and your friends.', 1, 1, 2, '/images/noimage.png', '2021/11/10', 3);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Cities: Skylines (PC) - Steam Key - GLOBAL', 200, 'a building game where players can customise and manage their own cities through challenges', 1, 1, 2, '/images/noimage.png', '2020/10/11',120.55, 2);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Stellaris Steam Key GLOBAL', 10, 'a space story game whhich leads the players through the story of the stars with missions to complete', 1, 1, 2, '/images/noimage.png', '2020/10/11', 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Dont Starve Together Steam Gift GLOBAL', 10, 'Dont Starve Together is a standalone multiplayer version of the critically acclaimed Dont Starve.', 1, 1, 2, '/images/noimage.png', '2020/10/11', 2);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region) 
VALUES ('Kerbal Space Program Steam Key GLOBAL', 10, 'An action space game where players are battling against aliens to reclaim the human territory', 1, 1, 2, '/images/noimage.png', '2020/10/11', 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Mount & Blade: Warband Steam Key GLOBAL', 200, 'An action FPS game with a 80s theme where players use sowrds and hunt to survive.', 1, 1, 2, '/images/noimage.png', '2020/10/11',79.99, 2);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Life is Strange: True Colors (PC) - Steam Key - GLOBAL', 108, 'A bold new era of the award-winning Life is Strange begins with an all-new playable lead character and a thrilling mystery to solve!', 1, 1, 2, '/images/noimage.png', '2020/10/11',100.50, 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('No Mans Sky (PC) - Steam Key - GLOBAL', 17, 'No Mans Sky is an action-adventure survival game developed by Hello Games and released by the same company in August 2016.', 1, 1, 2, '/images/noimage.png', '2020/10/11', 5, 1);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Tales of Arise | Ultimate Edition (PC) - Steam Key - GLOBAL', 79.90, 'ield the Blazing Sword and join a mysterious, untouchable girl to fight your oppressors.', 1, 1, 2, '/images/noimage.png', '2020/10/11', 23.97, 2);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('7 Days to Die Steam Key GLOBAL', 82.50, '7 Days to Die is a gripping post-apocalyptic first-person survival game, pitting you against zombies, hunger, and human fallibility', 1, 1, 2, '/images/noimage.png', '2020/10/11', 27.22, 3);
INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_discount, g_region) 
VALUES ('Overwatch Battle.net Key GLOBAL', 69.90, 'Overwatch is a 2016 first-person shooter multiplayer video game for PC developed and published by Blizzard Entertainment.', 1, 1, 2, '/images/noimage.png', '2020/10/11', 41.94, 1);

INSERT INTO public.user_detail (name, email, password, gender, c_card, phone) VALUES ('Junheng', 'junheng.tan@hotmail.com', '123password', 'M', 1, 85529404);
INSERT INTO public.user_detail (name, email, password, gender, c_card, phone) VALUES ('Adam', 'adam@gmail.com', '123password', 'M', 3, 97653242);
INSERT INTO public.user_detail (name, email, password, gender, c_card, phone) VALUES ('Lily', 'lily@gmail.com', '123password', 'F', 2, 81136175);




INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (1, 1, 1);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (1, 2, 1);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (2, 1, 1);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (2, 2, 1);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (2, 4, 1);

INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 1, 10);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 1, 9);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 2, 8);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 4, 7);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 1, 6);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 1, 5);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 8, 4);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 2, 3);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 4, 2);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 1, 1);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 10, 20);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 16, 25);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 21, 30);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 30, 12);
INSERT INTO public.order_detail (order_id, g_id, amount) VALUES (3762, 29, 17);



INSERT INTO public.order_history (user_id, buydate, total) VALUES (81624843,current_timestamp, 1);
INSERT INTO public.order_history (user_id, buydate, total) VALUES (81624843,current_timestamp, 1);


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