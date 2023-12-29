package common

import "flag"

type config struct {
	MediaFolder string
	Host        string
	Port        string
}

var Config = func() config {
	var host string
	var port string
	// Parse command-line flags
	flag.StringVar(&host, "host", "", "Media store host")
	flag.StringVar(&port, "port", "", "Media store port")
	flag.Parse()
	return config{
		MediaFolder: "media/",
		Host:        host,
		Port:        port,
	}
}()
