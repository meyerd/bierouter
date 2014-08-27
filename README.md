bierouter
=========

Optimal Route Software for Beer Drinking Trips

Purpose
=======

The purpose of this web application is to run in the browser (also on mobile
devices) and provide functionality for weighted imporance routing between
a set of points that have to be visited. 

Imaginge the following use case: In the city you live, there is a festival
for beer. There are a few participating locations spread out over the whole
city. You know the coordinates of each location and can input them into a 
mapping software. Also you can decide based on the description of the different
beers at each location, which location you want to visit in which not.
Amongst the locations you want to visit, you have a clear preference for some
locations, whereas some other location would be only considered worth visiting,
if they lie on a route to a location you definitely want to visit anyways.

This software lets you decide on locations to visit, give weights to them
and calculate the shortest route between those locations, visiting all the
locations once.

You are a drinking salesman. Drink responsibly!

Routing Algorithm
=================

The drinking salesman brings us to the problem of actually determining
the route between the locations. In mathematics there exists the problem of
the travelling salesman. It consists of some locations in a graph, and you want
to visit all the locations in the graph once. The problem of optimal drinking
is pretty much the same. You want to visit all the locations once, with the 
minimal travel time inbetween, but you additionally have a preference for
some of the locations.

Unfortunately, this problem is proven to belong to the class of problems,
where no polynomial time algorithm exists. That is why the implemented solution
method is really, really simple. First all the distances of the locations
are gathered in a distance matrix. This is easy. Second, all possible permutations
containing all locations are generated. Then the weighted pathlength of each
permutation is calculated and the shortest one is chose. Theoretically, this
is also easy, but in practice, this only works up to 10 or 11 locations. 
After that, the number of permutations is way to big to be computed.

*Update*: Apparently, the problem of optimal beer drinking routes is
very popular and Michael Trott from WolframAlpha also discussed this in
the [blog](http://blog.wolframalpha.com/2014/08/19/which-is-closer-local-beer-or-local-whiskey/). As far as I could find out, they use a kind of approximate
algorithm for bigger problems and an exact dynamic programming or 
integer programming based solution method for small problems. 
Unfortunately, I could not find out what exactly the approximate 
algorithm does or how it works.

License
=======

The code is licensed unter the GNU AGPL License (see `LICENSE`). As far as 
it is known to the author, this is compatible to the licensed of the used
javascript libraries (jQuery, jQuery Mobile and OpenLayers). If not, please
notify me.
