---
layout: default
modal-id: 4
date: 2014-04-01
img: projectslogo.jpg
title: Projects That Work
subtitle: Ruby on Rails Application
project-date: April 2014
client: Ed Metz 
category: project 
redirect-url: http://projects-that-work.herokuapp.com/
comments: true
comments-offset: col-sm-offset-2    

---

Projects That Work is a Ruby on Rails powered beta website for teachers to create and share service based learning projects.This was a collaboration under the UC Berkeley chapter of the nonprofit student organization Code The Change and Dr. Edward Metz, an education administrator in the Washington DC district. 

I acted as project manager for the team of five for the Spring 2014 semester until mid-summer. The core features we implemented included account registration with Authlogic as teachers or students, creating new service based learning projects, adding students to participate in the projects, and writing reviews of projects participated in or created. We did not utilize a policy based authorization system like CanCan which in retrospect would have clarified some role based concerns. 

Single Table Inheritance was used for writing reviews because the criteria fields for teacher and student reviews did not differ significantly though Polymorphic associations were considered as well. The only dependency for Postgresql as our development and production database was the hstore datatype which allowed us to store review fields in an array of key-value pairs so teacher and student specific fields would not result in empty columns in the reviews database table. 