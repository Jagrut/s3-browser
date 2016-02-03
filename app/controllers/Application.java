package controllers;

	
import play.db.ebean.Model;
import play.mvc.BodyParser;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.Http;
import views.html.index;
import views.html.login;
import play.libs.Json;
import play.libs.WS;
import play.libs.WS.Response;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.codehaus.jackson.JsonNode;
import org.jboss.netty.handler.codec.http.HttpResponse;
import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.util.*;
import com.fasterxml.jackson.core.TreeNode;

public class Application extends Controller {
	public static AmazonS3 amazonS3;
	public static String foldername;
	public static String[] awsarray=new String[3];

	public static Result index() {
		String error="";
		return ok(login.render(error));
	}


	public static Result listobject(String mname){
		System.out.println("in liar objecg");
		//String accessKey ="AKIAJWDV5KLQUY6BEO3A" ;
		//String secretKey ="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";
		//String s3Bucket ="cb-interview";
		ObjectListing objects;

		AWSCredentials awsCredentials = new BasicAWSCredentials(awsarray[0], awsarray[1]);
		amazonS3 = new AmazonS3Client(awsCredentials);


		int n=mname.indexOf("/");
		String foldername=mname.substring(n+1);
		objects = amazonS3.listObjects(new ListObjectsRequest(awsarray[2],foldername,"","/",1000)); //get content of foldername folder
		
		List<String> listofcommonprefixes=objects.getCommonPrefixes();  //get subfolder of foldername folder
		StringBuffer folderstring=new StringBuffer();
		int size=listofcommonprefixes.size();
		int i=0;
		System.out.println("size="+size);

		//all subfolder in one string :)
		for(i=0; i<size; i++){
			String intermediate=listofcommonprefixes.get(i);
			String afterremoveslash=intermediate.substring(0,intermediate.lastIndexOf("/"));
			folderstring.append(afterremoveslash.substring(afterremoveslash.lastIndexOf("/")+1)).append("/");
		}
		List<S3ObjectSummary> foldercontent=objects.getObjectSummaries();
		int iter=0;
		
		
		
		do {
	        for (S3ObjectSummary objectSummary : objects.getObjectSummaries()) {
	                System.out.println(objectSummary.getKey() + "\t" +
	                        objectSummary.getSize() + "\t" +
	                        StringUtils.fromDate(objectSummary.getLastModified()));
	        }
	        objects = amazonS3.listNextBatchOfObjects(objects);
	} while (objects.isTruncated());
	       
		//setting only file name in other words removing prefixes
		for(iter=0; iter<foldercontent.size(); iter++){
			String objectkey=foldercontent.get(iter).getKey();
			if(	objectkey.contains("/")){
				String newkey=objectkey.substring(objectkey.lastIndexOf("/")+1);
				foldercontent.get(iter).setKey(newkey);
			}
		}
		if(foldercontent.size()!=0)
		{	
		if(foldercontent.get(0).getKey().isEmpty()){
			foldercontent.remove(0);
		}
		}
		//appending folderstring to objectsummary
		S3ObjectSummary folderobject=new S3ObjectSummary();
		folderobject.setBucketName("//undefined//");
		folderobject.setKey(folderstring.toString());
		foldercontent.add(folderobject);

		response().setContentType("application/json; charset=UTF-8");
		return ok(Json.toJson(foldercontent));
	}

	public static Result authenticate() {
		Map<String, String[]> body = request().body().asFormUrlEncoded();

		awsarray[0] = body.get("accesskey")[0];
		awsarray[1] = body.get("password")[0];
		awsarray[2] =  body.get("bucket")[0];
		try{
			AWSCredentials awsCredentials = new BasicAWSCredentials(awsarray[0], awsarray[1]);
			amazonS3 = new AmazonS3Client(awsCredentials);
			ObjectListing objects = amazonS3.listObjects(awsarray[2]);

		}
		catch(AmazonServiceException e){
			String error=e.getMessage();
			return ok(login.render(error));
		}
		catch(AmazonClientException e){
			String error=e.getMessage();
			return ok(login.render(error));
		}
		String error="";
		return ok(index.render(awsarray[2],error));
	}
	/*public static Result removeauthenticate(){
		System.out.println("in remove");
		awsarray[0]="";
		awsarray[1]="";
		awsarray[2]="";
		System.out.println("nicely done");
		return ok("<h1>done</h1>");
		}*/
}