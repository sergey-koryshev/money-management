FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY . .
RUN dotnet build "Backend.sln" -c Debug

FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /src/Backend.WebApi/bin/Debug/net7.0 .
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 80
ENTRYPOINT ["dotnet", "Backend.WebApi.dll"]