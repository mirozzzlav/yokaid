package common

type config struct {
	Port string
}

var Config = config{
	Port: "9090",
}
