FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY src/TeacherControl.Api/TeacherControl.Api.csproj src/TeacherControl.Api/
RUN dotnet restore src/TeacherControl.Api/TeacherControl.Api.csproj
COPY src/TeacherControl.Api/ src/TeacherControl.Api/
RUN dotnet publish src/TeacherControl.Api/TeacherControl.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TeacherControl.Api.dll"]
