
import * as url from 'url';
import { normalizePath } from "../config";
import { BaseConfig, PathSuffix } from '../confluence';

import * as util from 'util';
import * as fs from "fs";
import * as path from "path";
import * as xml from "xml2js";

import YAML = require('yaml');


const readFile = util.promisify( fs.readFile );

jest.setTimeout(20000)

test( "xmlrpc path match", () => {

    let xmlrpcMatcher = new RegExp( `(${PathSuffix.XMLRPC})$` );
    let restMatcher = new RegExp( `(${PathSuffix.REST})$` );
    expect( "http://localhost/".match(xmlrpcMatcher) ).toBeFalsy();
    expect( "http://localhost/".match(restMatcher) ).toBeFalsy();
    expect( `http://localhost/${PathSuffix.XMLRPC}`.match(xmlrpcMatcher) ).toBeTruthy
    expect( `http://localhost/${PathSuffix.REST}`.match(restMatcher) ).toBeTruthy();

})

describe( "URL TEST", () => {


    test( "url formatting with template string", () => {
        const c:BaseConfig = {
            host: "localhost",
            port: -1,
            protocol: "http",
            path: "/confluence/"
        }
        const port = (Number(c.port) > -1 ) ? ':' + c.port : '' ; 

        expect( `${c.protocol + port}`).toEqual("http");
        expect( `${c.protocol + '://' + c.host + port + '/' + c.path }`).toEqual("http://localhost//confluence/");
        
        
    })

    test( "url formatting with urlobject and port invalid", () => {
        const c:url.UrlObject = {
            host: "localhost",
            port: -1,
            protocol: "http",
            pathname: "/confluence/"
        }
        expect( url.format(c) ).toEqual("http://localhost/confluence/");
        
        
    })
    test( "url formatting with urlobject and port valid", () => {
        const c:url.UrlObject = {
            hostname: "localhost",
            port: 8088,
            protocol: "http",
            pathname: "/confluence/"
        }
        expect( url.format(c) ).toEqual("http://localhost:8088/confluence/");
        
        c.pathname = 'confluence//';
        expect( url.format(c) ).toEqual("http://localhost:8088/confluence//");
        expect( url.format( normalizePath(c) )).toEqual("http://localhost:8088/confluence");

        c.pathname = 'confluence//rest/api';
        
        expect( url.format( c )).toEqual("http://localhost:8088/confluence//rest/api");
        const u = new url.URL( url.format(c) );
        expect( u.toString() ).toEqual( "http://localhost:8088/confluence//rest/api" );

        expect( url.format( normalizePath(c) )).toEqual("http://localhost:8088/confluence/rest/api");



    })


});

describe( 'XML TEST', () => {

    test( "xmlParse()", ( done ) => {
        let parser = new xml.Parser();
        let file = path.join( process.cwd(), "site", "site.xml" );
    
        readFile( file ).then( buff => {

            expect( buff ).not.toBeNull();

            parser.parseString(buff.toString(), (err:any, result:any) => {

                expect( result ).not.toBeNull();
                console.dir( result, { depth: 4 } );
    
                const home = result['bsc:site']['home'];
                expect( home ).toBeInstanceOf(Array);
                expect( home.length ).toEqual(1);
    
                console.dir( home, { depth: 4 } );

                done()
            })
        })
    
    })
 
});

describe( 'YAML TEST', () => {

    test( "yaml parse", async () => {
        const  filePath = path.join( process.cwd(), "site", "site.yml" );
        const file = await readFile( filePath );
        const content = YAML.parse( file.toString(), { } );
    
        expect( content ).not.toBeNull();
        expect( content.home ).not.toBeNull();
        expect( content.home.name ).toEqual('the first');
        expect( content.home.attachments ).toBeInstanceOf( Array );
        expect( content.home.attachments.length ).toEqual(1);
        expect( content.home.children ).toBeInstanceOf( Array );
        expect( content.home.children.length ).toEqual(2);

        
    
    })

})



