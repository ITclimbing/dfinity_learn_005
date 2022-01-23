import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import List "mo:base/List";
import Iter "mo:base/Iter";

actor class (owner  : Principal){
    public type Message = {
        author : Text;
        content : Text;
        time : Time.Time;
    };
    public type Microblog = actor {
        follows: shared query () ->async [Principal];
        posts : shared query (Time.Time) ->async [Message];
        timeline : shared (Time.Time) ->async [Message];
        get_name : shared query() -> async(?Text);
    };

    private stable var followed  = List.nil<Principal>();
    private stable var messages = List.nil<Message>();
    private stable var _owner = owner;
    private stable var _name : Text = "";
    private stable var _password : Text = "3c91cc913157bddeb282";

    public shared func follow( id : Principal) : async(Bool){
        // check 
        try{
            let cidActor : Microblog = actor(Principal.toText(id));
            ignore await cidActor.follows();
            ignore await cidActor.posts(0);
            ignore await cidActor.timeline(0);
            ignore await cidActor.get_name();
            // update list
            if (List.some(followed , func(x : Principal) : Bool{ x == id }) == false){
                followed := List.push(id , followed);
            };
            return true;
        }catch(e){
            return false;
        };
        
    };
    public shared query func  follows(): async ([Principal]){
        List.toArray(followed)
    };
    public shared(msg) func post( text : Text, pass : Text) : async(){
        // assert(msg.caller == _owner);
        assert(pass == _password);
        messages := List.push({
            author = _name;
            content = text;
            time = Time.now();
        } , messages);
    };
    public shared query func posts(since : Time.Time) : async([Message]){
        List.toArray(List.filter(messages, func (x : Message) : Bool { x.time > since }))
    };
    public shared func timeline(since : Time.Time) : async ([Message]){
        var all  = List.nil<Message>();
        for( id in Iter.fromList(followed)){
            try{
                let cidActor : Microblog = actor(Principal.toText(id));
                let msgs = await cidActor.posts(since);
                for( msg in Iter.fromArray(msgs)){
                    all := List.push(msg ,all)
                };
            }catch(e){
                
            };
        };
        List.toArray(all)
    };
    public shared(msg) func set_name(name: Text) {
        assert(msg.caller == _owner);
        _name := name;
    };
    public shared func get_name() : async ?Text {
        ?_name
     };
};
