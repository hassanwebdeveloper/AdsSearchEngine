from flask_restful import Api, Resource, reqparse



class ApiHandler(Resource):
  def get(self):



    return {
      'resultStatus': 'SUCCESS',
      'message': "Success"
      }

