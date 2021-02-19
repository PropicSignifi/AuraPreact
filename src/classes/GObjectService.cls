public with sharing class GObjectService {

    /*****************************
     * Code Demo
     *****************************/
    private static Map<String, Object> book1 = new Map<String, Object>{
        'id' => '1',
        'name' => 'First Book',
        'authorId' => '1'
    };

    private static Map<String, Object> book2 = new Map<String, Object>{
        'id' => '2',
        'name' => 'Second Book',
        'authorId' => '1'
    };

    private static Map<String, Object> book3 = new Map<String, Object>{
        'id' => '3',
        'name' => 'Third Book',
        'authorId' => '2'
    };

    private static List<Map<String, Object>> books = new List<Map<String, Object>>{
        book1,
        book2,
        book3
    };

    private static Map<String, Object> author1 = new Map<String, Object>{
        'id' => '1',
        'name' => 'First Author'
    };

    private static Map<String, Object> author2 = new Map<String, Object>{
        'id' => '2',
        'name' => 'Second Author'
    };

    private static List<Map<String, Object>> authors = new List<Map<String, Object>>{
        author1,
        author2
    };

    private static G.ObjectType bookType = new G.ObjectType('Book', 'Book__c')
        .addField('id', G.StringType, 'Id')
        .addField('name', G.StringType, 'Name')
        .addField('author', new G.ReferenceType('Author'), new BookAuthorResolver());

    private static G.ObjectType authorType = new G.ObjectType('Author')
        .addField('id', G.StringType)
        .addField('name', G.StringType)
        .addField('books', new G.ListType(new G.ReferenceType('Book')), new AuthorBooksResolver());

    private class BookAuthorResolver implements G.Resolver {
        public Object resolve(Map<String, Object> parent, Map<String, Object> args, G.ResolvingContext context) {
            return R.of(authors).find(R.propEq.apply('id', parent.get('authorId'))).toMap();
        }
    }

    private class AuthorBooksResolver implements G.BatchResolver {
        public List<Object> resolve(List<Object> parents, Map<String, Object> args, G.ResolvingContext context) {
            List<Object> result = new List<Object>();

            for(Object parentObj : parents) {
                Map<String, Object> parent = (Map<String, Object>)parentObj;
                List<Object> found = R.of(books).filter(R.propEq.apply('authorId', parent.get('id'))).toList();
                result.add(found);
            }

            return result;
        }
    }

    private class GetAuthorResolver implements G.Resolver {
        public Object resolve(Map<String, Object> parent, Map<String, Object> args, G.ResolvingContext context) {
            return R.of(authors).find(R.propEq.apply('id', args.get('id'))).toMap();
        }
    }

    private class GetBookResolver implements G.Resolver {
        public Object resolve(Map<String, Object> parent, Map<String, Object> args, G.ResolvingContext context) {
            return R.of(books).find(R.propEq.apply('id', args.get('id'))).toMap();
        }
    }

    public static void register() {
    }
}
