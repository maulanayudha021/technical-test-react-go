package database

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"backend-go-graphql/graph/model"

	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"golang.org/x/crypto/bcrypt"
)

var connectionString string = "mongodb+srv://yudha:OaZafUnyjC1cI6Pe@cluster0.hcznc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

type DB struct {
	client *mongo.Client
}

func Connect() *DB {
	client, err := mongo.NewClient(options.Client().ApplyURI(connectionString))
	if err != nil {
		log.Fatal(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
	}

	return &DB{
		client: client,
	}
}

var jwtSecret = []byte("my-secret-key")

// generate jwt token function
func generateToken(userID string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": userID,
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	})

	return token.SignedString(jwtSecret)
}

func (db *DB) Register(userInfo model.RegisterInput) (*model.AuthPayload, error) {
	userData := db.client.Database("my-db").Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var existingUser model.User
	err := userData.FindOne(ctx, bson.M{"email": userInfo.Email}).Decode(&existingUser)
	if err == nil {
		return nil, errors.New("email already exists")
	} else if !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, fmt.Errorf("failed to check existing email: %w", err)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userInfo.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	result, err := userData.InsertOne(ctx, bson.M{
		"name":     userInfo.Name,
		"email":    userInfo.Email,
		"password": string(hashedPassword),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}

	insertedID := result.InsertedID.(primitive.ObjectID).Hex()

	token, err := generateToken(insertedID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &model.AuthPayload{
		Token: token,
		User: &model.User{
			ID:       insertedID,
			Name:     userInfo.Name,
			Email:    userInfo.Email,
			Password: string(hashedPassword),
		},
	}, nil
}

func (db *DB) Login(email, password string) (*model.AuthPayload, error) {
	userData := db.client.Database("my-db").Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var user model.User
	err := userData.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("invalid email or password")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	token, err := generateToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &model.AuthPayload{
		Token: token,
		User:  &user,
	}, nil
}

func (db *DB) GetUser(id string) *model.User {
	userData := db.client.Database("my-db").Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_id, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": _id}
	var user model.User
	err := userData.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		log.Fatal(err)
	}
	return &user
}

func (db *DB) GetUsers() []*model.User {
	userData := db.client.Database("my-db").Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	var users []*model.User
	cursor, err := userData.Find(ctx, bson.D{})
	if err != nil {
		log.Fatal(err)
	}

	if err = cursor.All(context.TODO(), &users); err != nil {
		panic(err)
	}

	return users
}

func (db *DB) CreateUser(userInfo model.CreateUserInput) *model.User {
	userData := db.client.Database("my-db").Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userInfo.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	inserg, err := userData.InsertOne(ctx, bson.M{
		"name":     userInfo.Name,
		"email":    userInfo.Email,
		"password": string(hashedPassword),
	})

	if err != nil {
		log.Fatal(err)
	}

	insertedID := inserg.InsertedID.(primitive.ObjectID).Hex()
	returnUserList := model.User{
		ID:       insertedID,
		Name:     userInfo.Name,
		Email:    userInfo.Email,
		Password: string(hashedPassword),
	}
	return &returnUserList
}

func (db *DB) UpdateUser(userId string, userInfo model.UpdateUserInput) *model.User {
	userData := db.client.Database("my-db").Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	updateUserInfo := bson.M{}

	if userInfo.Name != nil {
		updateUserInfo["name"] = userInfo.Name
	}
	if userInfo.Email != nil {
		updateUserInfo["email"] = userInfo.Email
	}
	if userInfo.Password != nil {
		// Hash the new password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*userInfo.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal(err)
		}
		updateUserInfo["password"] = string(hashedPassword)
	}

	_id, _ := primitive.ObjectIDFromHex(userId)
	filter := bson.M{"_id": _id}
	update := bson.M{"$set": updateUserInfo}

	results := userData.FindOneAndUpdate(ctx, filter, update, options.FindOneAndUpdate().SetReturnDocument(1))

	var user model.User

	if err := results.Decode(&user); err != nil {
		log.Fatal(err)
	}

	return &user
}

func (db *DB) DeleteUser(userId string) *model.DeleteUserResponse {
	userData := db.client.Database("my-db").Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_id, _ := primitive.ObjectIDFromHex(userId)
	filter := bson.M{"_id": _id}
	_, err := userData.DeleteOne(ctx, filter)
	if err != nil {
		log.Fatal(err)
	}
	return &model.DeleteUserResponse{DeletedUserID: userId}
}

func (db *DB) GetProduct(id string) *model.Product {
	productData := db.client.Database("my-db").Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_id, _ := primitive.ObjectIDFromHex(id)
	filter := bson.M{"_id": _id}
	var product model.Product
	err := productData.FindOne(ctx, filter).Decode(&product)
	if err != nil {
		log.Fatal(err)
	}
	return &product
}

func (db *DB) GetProducts() []*model.Product {
	productData := db.client.Database("my-db").Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	var products []*model.Product
	cursor, err := productData.Find(ctx, bson.D{})
	if err != nil {
		log.Fatal(err)
	}

	if err = cursor.All(context.TODO(), &products); err != nil {
		panic(err)
	}

	return products
}

func (db *DB) CreateProduct(productInfo model.CreateProductInput) *model.Product {
	productData := db.client.Database("my-db").Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	inserg, err := productData.InsertOne(ctx, bson.M{"name": productInfo.Name, "price": productInfo.Price, "stock": productInfo.Stock})

	if err != nil {
		log.Fatal(err)
	}

	insertedID := inserg.InsertedID.(primitive.ObjectID).Hex()
	returnProductList := model.Product{ID: insertedID, Name: productInfo.Name, Price: productInfo.Price, Stock: productInfo.Stock}
	return &returnProductList
}

func (db *DB) UpdateProduct(productId string, userInfo model.UpdateProductInput) *model.Product {
	productData := db.client.Database("my-db").Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	updateUserInfo := bson.M{}

	if userInfo.Name != nil {
		updateUserInfo["name"] = userInfo.Name
	}
	if userInfo.Price != nil {
		updateUserInfo["price"] = userInfo.Price
	}
	if userInfo.Stock != nil {
		updateUserInfo["stock"] = userInfo.Stock
	}

	_id, _ := primitive.ObjectIDFromHex(productId)
	filter := bson.M{"_id": _id}
	update := bson.M{"$set": updateUserInfo}

	results := productData.FindOneAndUpdate(ctx, filter, update, options.FindOneAndUpdate().SetReturnDocument(1))

	var productObj model.Product

	if err := results.Decode(&productObj); err != nil {
		log.Fatal(err)
	}

	return &productObj
}

func (db *DB) DeleteProduct(productId string) *model.DeleteProductResponse {
	productData := db.client.Database("my-db").Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_id, _ := primitive.ObjectIDFromHex(productId)
	filter := bson.M{"_id": _id}
	_, err := productData.DeleteOne(ctx, filter)
	if err != nil {
		log.Fatal(err)
	}
	return &model.DeleteProductResponse{DeletedProductID: productId}
}
