all: build

restore:
	dotnet restore

build: restore
	dotnet publish -c Release -o ./dist 

test:
	dotnet test

clean:
	-@dotnet clean 2>&1 > /dev/null
	-@rm -rf ./dist
	-@rm -rf ./bin
	-@rm -rf ./obj

.PHONY: all restore build clean

.SILENT: clean distclean
