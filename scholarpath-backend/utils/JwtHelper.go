package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func getJwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Fallback value matching Laravel's env('JWT_SECRET', 'rahasiaku123')
		secret = "rahasiaku123"
	}
	return []byte(secret)
}

// Perhatikan: userID sekarang tipe uint sesuai dengan project PKM kamu
func GenerateJWT(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJwtSecret())
}

func VerifyJWT(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return getJwtSecret(), nil
	})
}