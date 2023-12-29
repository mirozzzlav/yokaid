package common

import "flag"

type config struct {
	MediaFolder string
	Port        string
}

var Config = func() config {
	var port string
	// Parse command-line flags
	flag.StringVar(&port, "port", "", "Media store port")
	flag.Parse()
	return config{
		MediaFolder: "media/",
		Port:        port,
	}
}()
