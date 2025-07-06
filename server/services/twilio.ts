import Twilio from 'twilio';

export class TwilioService {
  private client: any = null;
  private fromNumber: string;
  private isConfigured: boolean = false;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER || "+1234567890";
    
    // Only initialize Twilio if we have valid credentials
    if (accountSid && authToken && accountSid.startsWith('AC')) {
      try {
        this.client = new Twilio(accountSid, authToken);
        this.isConfigured = true;
      } catch (error) {
        console.warn('Twilio initialization failed:', error);
        this.isConfigured = false;
      }
    } else {
      console.warn('Twilio credentials not configured properly - calls will be simulated');
      this.isConfigured = false;
    }
  }

  async makeReservationCall(
    restaurantPhone: string,
    callScript: string,
    reservationDetails: {
      restaurantName: string;
      date: string;
      time: string;
      partySize: number;
      customerName: string;
      customerPhone: string;
      specialRequests?: string;
    }
  ): Promise<{
    callSid: string;
    status: string;
    estimatedDuration: number;
  }> {
    if (!this.isConfigured || !this.client) {
      // Simulate call for demo purposes
      console.log(`Simulated call to ${restaurantPhone} for ${reservationDetails.restaurantName}`);
      console.log(`Reservation details:`, reservationDetails);
      
      return {
        callSid: `DEMO_${Date.now()}`,
        status: 'completed',
        estimatedDuration: 120,
      };
    }

    try {
      // Create TwiML for the call
      const twiml = this.generateReservationTwiML(callScript, reservationDetails);
      
      // Make the call
      const call = await this.client.calls.create({
        to: restaurantPhone,
        from: this.fromNumber,
        twiml: twiml,
        timeout: 30,
        record: true, // Record the call for verification
      });

      return {
        callSid: call.sid,
        status: call.status,
        estimatedDuration: 120, // Estimated 2 minutes
      };
    } catch (error) {
      console.error('Twilio call error:', error);
      throw new Error(`Failed to make reservation call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateReservationTwiML(
    script: string,
    details: {
      restaurantName: string;
      date: string;
      time: string;
      partySize: number;
      customerName: string;
      customerPhone: string;
      specialRequests?: string;
    }
  ): string {
    // Generate TwiML for an automated reservation call
    // This would use Twilio's voice capabilities with AI
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Hello, I'm calling to make a reservation at ${details.restaurantName}. 
    I'd like to book a table for ${details.partySize} people on ${details.date} at ${details.time}. 
    The reservation is for ${details.customerName}, and the callback number is ${details.customerPhone}.
    ${details.specialRequests ? `We have a special request: ${details.specialRequests}.` : ''}
    Could you please confirm if this time is available?
  </Say>
  <Pause length="3"/>
  <Say voice="alice">
    Thank you for your time. If you need to reach us, please call ${details.customerPhone}. 
    Have a great day!
  </Say>
</Response>`;
  }

  async getCallStatus(callSid: string): Promise<{
    status: string;
    duration: number | null;
    recordingUrl?: string;
  }> {
    if (!this.isConfigured || !this.client) {
      // Return simulated status for demo calls
      if (callSid.startsWith('DEMO_')) {
        return {
          status: 'completed',
          duration: 120,
          recordingUrl: undefined,
        };
      }
      
      throw new Error('Twilio not configured - cannot check call status');
    }

    try {
      const call = await this.client.calls(callSid).fetch();
      
      // Get recording if available
      let recordingUrl;
      if (call.status === 'completed') {
        try {
          const recordings = await this.client.recordings.list({
            callSid: callSid,
            limit: 1
          });
          if (recordings.length > 0) {
            recordingUrl = `https://api.twilio.com${recordings[0].uri.replace('.json', '.mp3')}`;
          }
        } catch (recordingError) {
          console.warn('Could not fetch recording:', recordingError);
        }
      }

      return {
        status: call.status,
        duration: call.duration ? parseInt(call.duration) : null,
        recordingUrl,
      };
    } catch (error) {
      console.error('Error fetching call status:', error);
      throw new Error(`Failed to get call status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transcribeCall(recordingUrl: string): Promise<string> {
    try {
      // This would integrate with a speech-to-text service
      // For now, return a placeholder
      return "Call transcription would be implemented here using speech-to-text service";
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const twilioService = new TwilioService();
