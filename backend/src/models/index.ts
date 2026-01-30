import { sequelize } from "../config/database";
import { User } from "./User";
import { DiamondBid } from "./DiamondBid";
import { UserBid } from "./UserBid";
import { BidHistory } from "./BidHistory";
import { Diamond } from "./Diamond";
import { Result } from "./Result";
import { AutoBid } from "./AutoBid";

// All associations are defined inside individual model files.

export { sequelize, User, DiamondBid, UserBid, BidHistory, Diamond, Result, AutoBid };

