# SimpleBodyAnalysis

## What it is

A simple app to track and analyze body data, such as:

- Weight
- Body Fat
- Body Water
- Muscle Mass
- BMI
- Daily Calorie Requirement

Some while ago, I was obese and needed to lose weight.  
So I started a strict diet and lifting weights.  
In order to see the progress, not only in the mirror, I created this app.

## Infrastructure

This app runs entirely in azure and uses the following resources:

- EntraID (OAuth2.1 + OpenID Connect)
- Blob Storage (static web site hosting)
- Azure Tables (storage for the body data)

There is no backend, the app gets served from the blob storage that can be configured to host static web sites.  
After authenticating against EntraID, tokens get issued that can be used to query Azure tables that contains the actual body data.  

The data itself comes from a SÖHNLE Shape Sense scale.  
A csv export of the scale's data gets uploaded to the app(client-side) and parsed there before finally stored in Azure tables.
